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

function apiErrorMessage(data: unknown, fallback: string): string {
  if (!data || typeof data !== "object" || !("detail" in data)) {
    return fallback;
  }
  const { detail } = data as { detail?: unknown };
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    const parts = detail
      .map((item) => {
        if (typeof item === "string") return item;
        if (item && typeof item === "object" && "msg" in item) {
          return String((item as { msg: unknown }).msg);
        }
        return null;
      })
      .filter(Boolean);
    if (parts.length > 0) return parts.join(" ");
  }
  return fallback;
}

export async function analyzeResume(
  resume: File,
  jobText: string
): Promise<AnalyzeResult> {
  const form = new FormData();
  form.append("resume", resume);
  form.append("job_text", jobText.trim());

  let res: Response;
  try {
    res = await fetch(`${API_BASE}/api/analyze`, {
      method: "POST",
      body: form,
    });
  } catch {
    throw new Error(
      "Could not reach the API. Start the backend on port 8000, then try again."
    );
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      apiErrorMessage(
        data,
        res.status === 504 || res.status === 502
          ? "Analysis timed out or the server closed the connection. Try again in a moment."
          : "Analysis failed."
      )
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
    throw new Error(apiErrorMessage(data, "Could not apply changes."));
  }
  return res.blob();
}
