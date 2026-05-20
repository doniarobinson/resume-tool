import io

import pytest
from docx import Document
from httpx import ASGITransport, AsyncClient

from app.main import app
from app.models.schemas import Suggestion

JOB_TEXT_MIN = (
    "We are hiring a software engineer with Python and FastAPI experience. "
    "You will build APIs and work with cross-functional teams. "
)


@pytest.fixture
def job_text() -> str:
    return JOB_TEXT_MIN


@pytest.fixture
def docx_bytes() -> bytes:
    doc = Document()
    doc.add_heading("Experience", level=1)
    doc.add_paragraph("Built web apps with Python and React.")
    doc.add_paragraph("Improved API performance by 30%.")
    buffer = io.BytesIO()
    doc.save(buffer)
    return buffer.getvalue()


@pytest.fixture
def sample_suggestion() -> Suggestion:
    return Suggestion(
        id="s1",
        priority="high",
        section="Experience",
        reason="Highlight Python and API work for this role.",
        originalText="Built web apps with Python and React.",
        suggestedText="Built scalable web apps with Python, FastAPI, and React.",
        rank=1,
    )


@pytest.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


def docx_upload(content: bytes, filename: str = "resume.docx") -> dict:
    return {
        "resume": (
            filename,
            content,
            "application/vnd.openxmlformats-offocument.wordprocessingml.document",
        )
    }
