import json

from openai import OpenAI

from app.config import settings
from app.models.schemas import ResumeDocument, Suggestion

PRIORITY_ORDER = {"high": 0, "medium": 1, "low": 2}

SYSTEM_PROMPT = """You are a career coach helping tailor a resume to a job posting.
Return JSON only with this shape:
{
  "summary": "2-3 sentence overview of fit and main gaps",
  "jobTitle": "best guess at role title or null",
  "suggestions": [
    {
      "id": "s1",
      "priority": "high|medium|low",
      "section": "section name from resume",
      "reason": "why this change helps match the job",
      "originalText": "exact substring from resume to replace",
      "suggestedText": "replacement text",
      "rank": 1
    }
  ]
}
Rules:
- Provide 5-12 suggestions, prioritized by impact on job match.
- originalText MUST be copied verbatim from the resume (a single bullet or sentence).
- suggestedText should be similar length and professional tone.
- Focus on keywords, skills, and outcomes the job emphasizes.
- Do not invent experience the resume does not support; reframe and align wording instead."""


def _sort_suggestions(items: list[Suggestion]) -> list[Suggestion]:
    return sorted(
        items,
        key=lambda s: (PRIORITY_ORDER.get(s.priority, 9), s.rank, s.id),
    )


def generate_suggestions(
    resume: ResumeDocument, job_text: str, match_score: int
) -> tuple[str, str | None, list[Suggestion]]:
    client = OpenAI(api_key=settings.openai_api_key)
    resume_excerpt = "\n\n".join(
        f"[{b.section}] {b.text}" for b in resume.blocks[:40]
    )[:12000]

    user_content = (
        f"Match score (embedding similarity): {match_score}/100\n\n"
        f"JOB POSTING:\n{job_text[:10000]}\n\n"
        f"RESUME:\n{resume_excerpt}"
    )

    response = client.chat.completions.create(
        model=settings.openai_model,
        temperature=0.3,
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_content},
        ],
    )

    raw = response.choices[0].message.content or "{}"
    data = json.loads(raw)
    summary = data.get("summary", "Analysis complete.")
    job_title = data.get("jobTitle")

    suggestions: list[Suggestion] = []
    for item in data.get("suggestions", []):
        original = item.get("originalText", "").strip()
        if not original:
            continue
        if original not in resume.full_text:
            matched = next(
                (b.text for b in resume.blocks if original in b.text or b.text in original),
                None,
            )
            if matched:
                original = matched if len(original) < len(matched) else original
            else:
                continue

        suggestions.append(
            Suggestion(
                id=item.get("id", f"s{len(suggestions) + 1}"),
                priority=item.get("priority", "medium"),
                section=item.get("section", "General"),
                reason=item.get("reason", "Improve alignment with job posting."),
                originalText=original,
                suggestedText=item.get("suggestedText", original),
                rank=int(item.get("rank", len(suggestions) + 1)),
            )
        )

    return summary, job_title, _sort_suggestions(suggestions)
