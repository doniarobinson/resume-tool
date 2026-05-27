# Job Application Agent

Tailor your resume to a job posting: semantic match score, prioritized rewrite suggestions, and DOCX download.

## Stack

- **Frontend:** Next.js 16 (npm) — `frontend/`
- **Backend:** FastAPI (Python) — `backend/`

## Prerequisites

- Node.js 20+
- Python 3.11+
- [Google Gemini API key](https://aistudio.google.com/apikey)

## Setup

### 1. Backend

```bash
cd backend
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt

cp .env.example .env        # then add your GEMINI_API_KEY
```

> **Do not** run `pip install` or `python3 -m pip install` without the venv — macOS/Homebrew Python returns `externally-managed-environment`. Always use `.venv/bin/python -m pip`.
>
> **Cursor note:** You can run the server without `activate`: `.venv/bin/uvicorn app.main:app --reload --port 8000`

### 2. Frontend

```bash
cd frontend
npm install
```

## Run locally

Terminal 1 — API on port 8000:

```bash
cd backend
.venv/bin/uvicorn app.main:app --reload --port 8000
# Or after: source .venv/bin/activate
# uvicorn app.main:app --reload --port 8000
```

Terminal 2 — UI on port 3000 (proxies `/api` to backend):

```bash
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Usage

1. Upload a **DOCX** resume (PDF not supported in v1).
2. Paste the full job description.
3. Review match score and suggestions (high → medium → low).
4. Check changes to accept, then download the tailored DOCX.

## Limitations (v1)

- DOCX in/out only
- Basic DOCX structure preserved (headings, paragraphs, bullets); complex layouts may shift
- Requires Google Gemini API for embeddings and suggestions
- Job description must be pasted (no URL fetching — avoids server-side request risks)

## Environment variables

See [.env.example](.env.example).

## Backend tests

```bash
cd backend
.venv/bin/python -m pip install -r requirements-dev.txt
.venv/bin/python -m pytest
```
