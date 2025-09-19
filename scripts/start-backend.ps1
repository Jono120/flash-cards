param(
  [int]$Port = 8000
)

Write-Host "Starting FastAPI backend on port $Port..."
$env:PYTHONUNBUFFERED = "1"
$env:ENVIRONMENT = "development"

python -m uvicorn backend.main:app --host 127.0.0.1 --port $Port --reload
