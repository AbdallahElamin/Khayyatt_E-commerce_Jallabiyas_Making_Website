# Start the FastAPI Server inside the local Python 3.11 virtual environment

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

if (-not (Test-Path ".venv_311\Scripts\activate.ps1")) {
    Write-Host "Error: Virtual environment not found at .venv_311" -ForegroundColor Red
    Write-Host "Please follow the README to set up the environment." -ForegroundColor Yellow
    exit 1
}

Write-Host "Activating virtual environment..." -ForegroundColor Cyan
& .\.venv_311\Scripts\activate.ps1

Write-Host "Starting TailorVision API on http://localhost:8000..." -ForegroundColor Green
python -m uvicorn tailorvision.api.server:app --host 0.0.0.0 --port 8000 --reload
