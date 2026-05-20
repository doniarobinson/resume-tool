import math

from openai import OpenAI

from app.config import settings


def _cosine_similarity(a: list[float], b: list[float]) -> float:
    dot = sum(x * y for x, y in zip(a, b))
    norm_a = math.sqrt(sum(x * x for x in a))
    norm_b = math.sqrt(sum(x * x for x in b))
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return dot / (norm_a * norm_b)


def compute_match_score(resume_text: str, job_text: str) -> int:
    client = OpenAI(api_key=settings.openai_api_key)
    response = client.embeddings.create(
        model=settings.embedding_model,
        input=[resume_text[:8000], job_text[:8000]],
    )
    resume_emb = response.data[0].embedding
    job_emb = response.data[1].embedding
    similarity = _cosine_similarity(resume_emb, job_emb)
    score = int(round(max(0.0, min(1.0, (similarity + 0.2) / 1.1)) * 100))
    return max(0, min(100, score))
