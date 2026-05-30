# Execution Plan: Khayyat Refactoring & Feature Implementation

**Protocol:** Execute the following prompts sequentially in the Antigravity IDE. Do not proceed to the next prompt until the current goal is fully tested and verified. 

---

### Prompt 1: Python AI Measurement Tool Integration
**Target:** `src/components/wizard/step3/AiMeasurementPanel.tsx`, Project Root
```text
/goal
MISSION: Integrate a local Python-based anthropometric measurement tool into the Wizard's third step.

1. Create a new directory at the project root named `api/python-engine/`. This is where the user will drop their third-party Python tool folder.
2. Inside `api/python-engine/`, create a `README.md` explaining that this service must be run independently (e.g., via FastAPI/Flask) since Cloudflare Workers cannot natively execute raw Python modules.
3. Update `src/components/wizard/step3/AiMeasurementPanel.tsx`. Remove the existing mock 2-second delay logic.
4. Replace it with a real `fetch()` call to `http://localhost:8000/measure` (or the anticipated local Python API port). Ensure the request sends the user's uploaded photo and height, and maps the JSON response to the `measurements` state in `WizardContext`.
5. Add error handling to gracefully fall back to manual entry if the Python API is unreachable.