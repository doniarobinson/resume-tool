import math
from concurrent.futures import ThreadPoolExecutor

from app.config import settings
from app.services.gemini_client import get_client


def _cosine_similarity(a: list[float], b: list[float]) -> float:
    dot = sum(x * y for x, y in zip(a, b))
    norm_a = math.sqrt(sum(x * x for x in a))
    norm_b = math.sqrt(sum(x * x for x in b))
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return dot / (norm_a * norm_b)


def _embed_text(text: str) -> list[float]:
    client = get_client()
    response = client.models.embed_content(
        model=settings.embedding_model,
        contents=text[:8000],
    )
    return response.embeddings[0].values


def compute_match_score(resume_text: str, job_text: str) -> int:
    with ThreadPoolExecutor(max_workers=2) as pool:
        resume_future = pool.submit(_embed_text, resume_text)
        job_future = pool.submit(_embed_text, job_text)
        resume_emb = resume_future.result()
        job_emb = job_future.result()
    similarity = _cosine_similarity(resume_emb, job_emb)
    score = int(round(max(0.0, min(1.0, (similarity + 0.2) / 1.1)) * 100))
    return max(0, min(100, score))
