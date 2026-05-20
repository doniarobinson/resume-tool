import re

MIN_JOB_TEXT_LENGTH = 50


def normalize_pasted_text(text: str) -> str:
    cleaned = text.strip()
    cleaned = re.sub(r"\n{3,}", "\n\n", cleaned)
    return cleaned


def resolve_job_text(job_text: str | None) -> str:
    pasted = normalize_pasted_text(job_text) if job_text else ""
    if pasted and len(pasted) >= MIN_JOB_TEXT_LENGTH:
        return pasted

    raise ValueError(
        f"Paste the full job description (at least {MIN_JOB_TEXT_LENGTH} characters)."
    )
