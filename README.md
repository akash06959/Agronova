# Agronova

A full-stack agriculture platform with a Python backend, a Vite/React frontend, and optional ML models for soil and crop analysis.

## Project Structure
- `backend/`: FastAPI backend (Python)
- `frontend/`: Vite + React app (Node)
- `ml_model/`: Datasets and trained models (ignored by Git by default)

## Prerequisites
- Python 3.10+
- Node.js 18+

## Backend Setup
```bash
cd backend
python -m venv .venv
# Windows PowerShell
. .venv/Scripts/Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload
```
API will run at `http://127.0.0.1:8000`.

## Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
App will run at `http://127.0.0.1:5173` (default Vite port).

## Environment Variables
If you have secrets, create `.env` files in `backend/` or `frontend/` as needed.
Do not commit them. See `.gitignore`.

## GitHub Upload
This repo is cleaned for GitHub:
- `node_modules`, caches, Python `__pycache__`, DB files excluded
- Large ML datasets and model binaries excluded

If you want to include models, remove the relevant ignores in `.gitignore` under `ml_model/`.

## License
MIT — see `LICENSE`.
