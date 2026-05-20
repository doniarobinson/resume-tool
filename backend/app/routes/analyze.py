from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from app.config import settings
from app.models.schemas import AnalyzeResponse
from app.services.job_parser import resolve_job_text
from app.services.resume_parser import parse_docx
from app.services.similarity import compute_match_score
from app.services.suggestions import generate_suggestions

router = APIRouter()


def _validate_docx(upload: UploadFile, content: bytes) -> None:
    name = (upload.filename or "").lower()
    if not name.endswith(".docx"):
        raise HTTPException(
            status_code=400,
            detail="v1 supports DOCX only — export your resume as .docx and try again.",
        )
    if len(content) > settings.max_upload_bytes:
        raise HTTPException(status_code=400, detail="File exceeds 5 MB limit.")


def _require_api_key() -> None:
    if not settings.openai_api_key:
        raise HTTPException(
            status_code=503,
            detail="OPENAI_API_KEY is not configured on the server.",
        )


@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_resume(
    resume: UploadFile = File(...),
    job_url: str | None = Form(default=None),
    job_text: str | None = Form(default=None),
):
    _require_api_key()
    content = await resume.read()
    _validate_docx(resume, content)

    try:
        job_description = await resolve_job_text(job_url, job_text)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    try:
        resume_doc = parse_docx(content)
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Could not parse DOCX file.") from exc

    try:
        match_score = compute_match_score(resume_doc.full_text, job_description)
        summary, job_title, suggestions = generate_suggestions(
            resume_doc, job_description, match_score
        )
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Analysis failed: {exc}") from exc

    return AnalyzeResponse(
        matchScore=match_score,
        summary=summary,
        jobTitle=job_title,
        jobText=job_description,
        suggestions=suggestions,
    )
