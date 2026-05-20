import re

import httpx
import trafilatura

USER_AGENT = (
    "Mozilla/5.0 (compatible; JobApplicationAgent/1.0; +https://localhost)"
)


def normalize_pasted_text(text: str) -> str:
    cleaned = text.strip()
    cleaned = re.sub(r"\n{3,}", "\n\n", cleaned)
    return cleaned


async def fetch_job_from_url(url: str) -> str:
    async with httpx.AsyncClient(
        follow_redirects=True,
        timeout=20.0,
        headers={"User-Agent": USER_AGENT},
    ) as client:
        response = await client.get(url)
        response.raise_for_status()
        html = response.text

    extracted = trafilatura.extract(
        html,
        include_comments=False,
        include_tables=True,
        favor_precision=True,
    )
    if extracted and len(extracted.strip()) >= 100:
        return normalize_pasted_text(extracted)

    raise ValueError(
        "Could not extract enough text from that URL. Paste the job description instead."
    )


async def resolve_job_text(job_url: str | None, job_text: str | None) -> str:
    pasted = normalize_pasted_text(job_text) if job_text else ""
    if pasted and len(pasted) >= 50:
        return pasted

    if job_url and job_url.strip():
        try:
            return await fetch_job_from_url(job_url.strip())
        except Exception as exc:
            if pasted:
                return pasted
            raise ValueError(str(exc)) from exc

    raise ValueError("Provide a job posting URL or paste the job description.")
