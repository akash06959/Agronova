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

## Streamlit App (Optional)
A lightweight Streamlit UI is available for quickly demoing the Kerala AI assistant without running the FastAPI + React stack.

### Local Run
```bash
pip install -r requirements.txt
streamlit run streamlit_app.py
```
The Streamlit dashboard mirrors the backend models and can be hosted on Streamlit Community Cloud.

### Deploy on Streamlit Cloud
1. Push this repository (including `ml_model/` artifacts) to GitHub.
2. Sign in at [share.streamlit.io](https://share.streamlit.io) and create a **New app**.
3. Select your repo/branch and set **Main file path** to `streamlit_app.py`.
4. Leave the default packages install command (`pip install -r requirements.txt`). Streamlit will install backend + frontend dependencies plus `streamlit`.
5. (Optional) Add secrets/environment variables in the Streamlit dashboard if you point the app to external databases instead of the bundled SQLite DB.
6. Deploy — Streamlit will build the app and serve it at a unique URL you can share.

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
