import json

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import Response

from app.config import settings
from app.models.schemas import Suggestion
from app.services.resume_writer import apply_suggestions_to_docx

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


@router.post("/apply")
async def apply_changes(
    resume: UploadFile = File(...),
    selected_ids: str = Form(...),
    suggestions_json: str = Form(...),
):
    content = await resume.read()
    _validate_docx(resume, content)

    try:
        selected = json.loads(selected_ids)
        raw_suggestions = json.loads(suggestions_json)
    except json.JSONDecodeError as exc:
        raise HTTPException(status_code=400, detail="Invalid JSON payload.") from exc

    if not isinstance(selected, list):
        raise HTTPException(status_code=400, detail="selected_ids must be a JSON array.")

    suggestions = [Suggestion.model_validate(item) for item in raw_suggestions]

    try:
        output = apply_suggestions_to_docx(content, suggestions, selected)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Could not apply changes: {exc}") from exc

    filename = (resume.filename or "resume").rsplit(".", 1)[0] + "-tailored.docx"
    return Response(
        content=output,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
