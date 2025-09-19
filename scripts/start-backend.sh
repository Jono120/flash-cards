#!/usr/bin/env bash
set -euo pipefail
PORT=${1:-8000}
export PYTHONUNBUFFERED=1
export ENVIRONMENT=development

exec python -m uvicorn backend.main:app --host 127.0.0.1 --port "$PORT" --reload
