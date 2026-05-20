export type Priority = "high" | "medium" | "low";

export interface Suggestion {
  id: string;
  priority: Priority;
  section: string;
  reason: string;
  originalText: string;
  suggestedText: string;
  rank?: number;
}

export interface AnalyzeResult {
  matchScore: number;
  summary: string;
  jobTitle?: string | null;
  jobText: string;
  suggestions: Suggestion[];
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

export async function analyzeResume(
  resume: File,
  jobText: string
): Promise<AnalyzeResult> {
  const form = new FormData();
  form.append("resume", resume);
  form.append("job_text", jobText.trim());

  const res = await fetch(`${API_BASE}/api/analyze`, {
    method: "POST",
    body: form,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      typeof data.detail === "string" ? data.detail : "Analysis failed."
    );
  }
  return data as AnalyzeResult;
}

export async function applySuggestions(
  resume: File,
  selectedIds: string[],
  suggestions: Suggestion[]
): Promise<Blob> {
  const form = new FormData();
  form.append("resume", resume);
  form.append("selected_ids", JSON.stringify(selectedIds));
  form.append("suggestions_json", JSON.stringify(suggestions));

  const res = await fetch(`${API_BASE}/api/apply`, {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(
      typeof data.detail === "string" ? data.detail : "Could not apply changes."
    );
  }
  return res.blob();
}
