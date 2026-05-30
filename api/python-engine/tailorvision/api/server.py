import os
import tempfile
from fastapi import FastAPI, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
import shutil

from tailorvision import TailorVisionPipeline, PipelineConfig

app = FastAPI(title="TailorVision API")

# Allow CORS for the local Vite dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/measure")
async def measure(
    front_photo: UploadFile,
    side_photo: UploadFile,
    height_cm: float = Form(...)
):
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

        # Configure pipeline with known height, set to male, traditional garment, and verbose logs
        config = PipelineConfig(
            known_height_cm=height_cm,
            gender="male",
            garment_type="traditional",
            device="cpu",
            save_debug_artifacts=False,
            log_level="DEBUG"
        )
        
        # Run the tailorvision pipeline
        pipeline = TailorVisionPipeline(config)
        result = pipeline.run(front_path, side_path)

        measurements = result.measurements_cm
        
        # Map the Python outputs to the frontend expected MeasurementKey format
        mapped_data = {
            "neck": measurements.get("neck_circumference"),
            "shoulderToCrotch": measurements.get("shoulder_to_crotch_height"),
            "chest": measurements.get("chest_circumference"),
            "waist": measurements.get("waist_circumference"),
            "hips": measurements.get("hip_circumference"),
            "bicep": measurements.get("bicep_right_circumference"),
            "armLength": measurements.get("arm_right_length"),
            "legHeight": measurements.get("inside_leg_height"),
            "thigh": measurements.get("thigh_left_circumference"),
            "shoulderBreadth": measurements.get("shoulder_breadth")
        }
        
        return mapped_data

    except Exception as e:
        print(f"Error processing measurements: {e}")
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
