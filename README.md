# Job Application Agent

Tailor your resume to a job posting: semantic match score, prioritized rewrite suggestions, and DOCX download.

## Stack

- **Frontend:** Next.js 16 (npm) — `frontend/`
- **Backend:** FastAPI (Python) — `backend/`

## Prerequisites

- Node.js 20+
- Python 3.11+
- [OpenAI API key](https://platform.openai.com/api-keys)

## Setup

### 1. Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp ../.env.example .env     # then add your OPENAI_API_KEY
```

### 2. Frontend

```bash
cd frontend
npm install
```

## Run locally

Terminal 1 — API on port 8000:

```bash
cd backend
source .venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

Terminal 2 — UI on port 3000 (proxies `/api` to backend):

```bash
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Usage

1. Upload a **DOCX** resume (PDF not supported in v1).
2. Paste a job URL and/or the full job description.
3. Review match score and suggestions (high → medium → low).
4. Check changes to accept, then download the tailored DOCX.

## Limitations (v1)

- DOCX in/out only
- Basic DOCX structure preserved (headings, paragraphs, bullets); complex layouts may shift
- Requires OpenAI API for embeddings and suggestions
- Job URLs may fail on protected sites — paste the description instead

## Environment variables

See [.env.example](.env.example).
