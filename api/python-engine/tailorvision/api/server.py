import os
import tempfile
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import shutil

from tailorvision import TailorVisionPipeline, PipelineConfig

logger = logging.getLogger(__name__)

# ── Singleton pipeline ─────────────────────────────────────────────────────────
# The pipeline loads Mediapipe models, SMPL-X weights, and the SMPL-Anthropometry
# library on first construction. Creating it ONCE at startup (not per-request)
# avoids reloading ~500 MB of model weights on every call — the main cause of the
# ~3 minute latency.  Only known_height_cm changes per request; all other config
# is fixed at startup.

_BASE_CONFIG = PipelineConfig(
    gender="male",
    garment_type="traditional",
    device="cpu",
    save_debug_artifacts=False,
    log_level="INFO",
    # Reduce optimizer iterations: 80 steps gives good accuracy in ~20-40 s on CPU
    # vs 300 steps which takes 2-3 minutes. Increase if accuracy needs to improve.
    fit_iterations=80,
    # Use 1 MC sample for uncertainty — avoids running the fitter 5 extra times
    uncertainty_n_samples=1,
)

_pipeline: TailorVisionPipeline | None = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Warm up the pipeline once when the server starts."""
    global _pipeline
    logger.info("⏳ Warming up TailorVision pipeline (loading models)…")
    _pipeline = TailorVisionPipeline(_BASE_CONFIG)
    logger.info("✅ Pipeline ready — models loaded.")
    yield
    # Cleanup (nothing needed)
    _pipeline = None


app = FastAPI(title="TailorVision API", lifespan=lifespan)

# Allow CORS for the local Vite dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    """Liveness probe — returns 200 when the server and pipeline are ready."""
    return {"status": "ok", "pipeline_ready": _pipeline is not None}


@app.post("/measure")
async def measure(
    front_photo: UploadFile,
    side_photo: UploadFile,
    height_cm: float = Form(...),
):
    global _pipeline
    if _pipeline is None:
        raise HTTPException(status_code=503, detail="Pipeline not initialised yet.")

    front_path = None
    side_path = None

    try:
        # Save uploaded images to temporary files
        with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as f_front:
            shutil.copyfileobj(front_photo.file, f_front)
            front_path = f_front.name

        with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as f_side:
            shutil.copyfileobj(side_photo.file, f_side)
            side_path = f_side.name

        # Update the height for this request and run the cached pipeline
        _pipeline._cfg.known_height_cm = height_cm
        logger.info("Running pipeline for height=%.1f cm", height_cm)

        result = _pipeline.run(front_path, side_path)
        measurements = result.measurements_cm

        # Map the Python outputs to the frontend expected MeasurementKey format
        mapped_data = {
            "neck":            float(measurements["neck_circumference"])        if "neck_circumference"        in measurements else None,
            "shoulderToCrotch":float(measurements["shoulder_to_crotch_height"]) if "shoulder_to_crotch_height" in measurements else None,
            "chest":           float(measurements["chest_circumference"])       if "chest_circumference"       in measurements else None,
            "waist":           float(measurements["waist_circumference"])       if "waist_circumference"       in measurements else None,
            "hips":            float(measurements["hip_circumference"])         if "hip_circumference"         in measurements else None,
            "bicep":           float(measurements["bicep_right_circumference"]) if "bicep_right_circumference" in measurements else None,
            "armLength":       float(measurements["arm_right_length"])          if "arm_right_length"          in measurements else None,
            "legHeight":       float(measurements["inside_leg_height"])         if "inside_leg_height"         in measurements else None,
            "thigh":           float(measurements["thigh_left_circumference"])  if "thigh_left_circumference"  in measurements else None,
            "shoulderBreadth": float(measurements["shoulder_breadth"])          if "shoulder_breadth"          in measurements else None,
        }

        logger.info("Returning mapped measurements: %s", mapped_data)
        return mapped_data

    except Exception as e:
        logger.error("Error processing measurements: %s", e, exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # Clean up temporary files
        if front_path and os.path.exists(front_path):
            os.remove(front_path)
        if side_path and os.path.exists(side_path):
            os.remove(side_path)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("tailorvision.api.server:app", host="0.0.0.0", port=8000, reload=True)
