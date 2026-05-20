from typing import Literal

from pydantic import BaseModel, Field


class ResumeBlock(BaseModel):
    section: str
    text: str
    block_index: int


class ResumeDocument(BaseModel):
    full_text: str
    blocks: list[ResumeBlock]


class Suggestion(BaseModel):
    id: str
    priority: Literal["high", "medium", "low"]
    section: str
    reason: str
    original_text: str = Field(alias="originalText")
    suggested_text: str = Field(alias="suggestedText")
    rank: int = 0

    model_config = {"populate_by_name": True}


class AnalyzeResponse(BaseModel):
    match_score: int = Field(alias="matchScore")
    summary: str
    job_title: str | None = Field(default=None, alias="jobTitle")
    job_text: str = Field(alias="jobText")
    suggestions: list[Suggestion]

    model_config = {"populate_by_name": True, "by_alias": True}
