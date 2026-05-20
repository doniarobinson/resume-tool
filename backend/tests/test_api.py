import io
import json
from unittest.mock import patch

import pytest
from docx import Document

from app.config import settings
from app.services.job_parser import normalize_pasted_text
from tests.conftest import docx_upload


@pytest.mark.asyncio
async def test_health(client):
    response = await client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


@pytest.mark.asyncio
async def test_analyze_returns_503_without_api_key(client, docx_bytes, job_text):
    with patch.object(settings, "gemini_api_key", ""):
        response = await client.post(
            "/api/analyze",
            files=docx_upload(docx_bytes),
            data={"job_text": job_text},
        )

    assert response.status_code == 503
    assert "GEMINI_API_KEY" in response.json()["detail"]


@pytest.mark.asyncio
async def test_analyze_rejects_non_docx(client, docx_bytes, job_text, monkeypatch):
    monkeypatch.setattr(settings, "gemini_api_key", "test-key")
    response = await client.post(
        "/api/analyze",
        files=docx_upload(docx_bytes, filename="resume.pdf"),
        data={"job_text": job_text},
    )

    assert response.status_code == 400
    assert "DOCX only" in response.json()["detail"]


@pytest.mark.asyncio
async def test_analyze_rejects_short_job_text(client, docx_bytes, monkeypatch):
    monkeypatch.setattr(settings, "gemini_api_key", "test-key")
    response = await client.post(
        "/api/analyze",
        files=docx_upload(docx_bytes),
        data={"job_text": "too short"},
    )

    assert response.status_code == 400
    assert "50 characters" in response.json()["detail"]


@pytest.mark.asyncio
async def test_analyze_success(client, docx_bytes, job_text, sample_suggestion, monkeypatch):
    monkeypatch.setattr(settings, "gemini_api_key", "test-key")

    with (
        patch("app.routes.analyze.compute_match_score", return_value=72),
        patch(
            "app.routes.analyze.generate_suggestions",
            return_value=("Strong alignment with backend role.", "Software Engineer", [sample_suggestion]),
        ),
    ):
        response = await client.post(
            "/api/analyze",
            files=docx_upload(docx_bytes),
            data={"job_text": job_text},
        )

    assert response.status_code == 200
    body = response.json()
    assert body["matchScore"] == 72
    assert body["summary"] == "Strong alignment with backend role."
    assert body["jobTitle"] == "Software Engineer"
    assert body["jobText"] == normalize_pasted_text(job_text)
    assert len(body["suggestions"]) == 1
    assert body["suggestions"][0]["id"] == "s1"
    assert body["suggestions"][0]["priority"] == "high"


@pytest.mark.asyncio
async def test_analyze_returns_502_when_analysis_fails(client, docx_bytes, job_text, monkeypatch):
    monkeypatch.setattr(settings, "gemini_api_key", "test-key")

    with patch(
        "app.routes.analyze.compute_match_score",
        side_effect=RuntimeError("Gemini unavailable"),
    ):
        response = await client.post(
            "/api/analyze",
            files=docx_upload(docx_bytes),
            data={"job_text": job_text},
        )

    assert response.status_code == 502
    assert "Analysis failed" in response.json()["detail"]


@pytest.mark.asyncio
async def test_apply_rejects_non_docx(client, docx_bytes, sample_suggestion):
    response = await client.post(
        "/api/apply",
        files=docx_upload(docx_bytes, filename="resume.txt"),
        data={
            "selected_ids": json.dumps(["s1"]),
            "suggestions_json": json.dumps([sample_suggestion.model_dump(by_alias=True)]),
        },
    )

    assert response.status_code == 400
    assert "DOCX only" in response.json()["detail"]


@pytest.mark.asyncio
async def test_apply_rejects_invalid_json(client, docx_bytes):
    response = await client.post(
        "/api/apply",
        files=docx_upload(docx_bytes),
        data={
            "selected_ids": "not-json",
            "suggestions_json": "[]",
        },
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Invalid JSON payload."


@pytest.mark.asyncio
async def test_apply_rejects_non_array_selected_ids(client, docx_bytes, sample_suggestion):
    response = await client.post(
        "/api/apply",
        files=docx_upload(docx_bytes),
        data={
            "selected_ids": json.dumps({"id": "s1"}),
            "suggestions_json": json.dumps([sample_suggestion.model_dump(by_alias=True)]),
        },
    )

    assert response.status_code == 400
    assert "JSON array" in response.json()["detail"]


@pytest.mark.asyncio
async def test_apply_returns_docx_with_replacement(client, docx_bytes, sample_suggestion):
    response = await client.post(
        "/api/apply",
        files=docx_upload(docx_bytes),
        data={
            "selected_ids": json.dumps(["s1"]),
            "suggestions_json": json.dumps([sample_suggestion.model_dump(by_alias=True)]),
        },
    )

    assert response.status_code == 200
    assert (
        response.headers["content-type"]
        == "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    )
    assert "resume-tailored.docx" in response.headers.get("content-disposition", "")
    assert len(response.content) > 0
    doc = Document(io.BytesIO(response.content))
    paragraphs = [p.text for p in doc.paragraphs if p.text]
    assert any("Built scalable web apps" in text for text in paragraphs)


@pytest.mark.asyncio
async def test_apply_returns_original_when_nothing_selected(client, docx_bytes, sample_suggestion):
    response = await client.post(
        "/api/apply",
        files=docx_upload(docx_bytes),
        data={
            "selected_ids": json.dumps([]),
            "suggestions_json": json.dumps([sample_suggestion.model_dump(by_alias=True)]),
        },
    )

    assert response.status_code == 200
    assert response.content == docx_bytes
