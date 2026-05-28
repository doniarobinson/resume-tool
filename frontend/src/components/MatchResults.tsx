"use client";

import type { AnalyzeResult, Priority, Suggestion } from "@/lib/api";

interface MatchResultsProps {
  result: AnalyzeResult;
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  onSelectPriority: (priority: Priority) => void;
}

const PRIORITY_LABELS: Record<Priority, string> = {
  high: "High priority",
  medium: "Medium priority",
  low: "Low priority",
};

const ORDER: Priority[] = ["high", "medium", "low"];

const PILL_CLASS: Record<Priority, string> = {
  high: "arcade-pill-high",
  medium: "arcade-pill-medium",
  low: "arcade-pill-low",
};

function groupByPriority(suggestions: Suggestion[]) {
  return ORDER.map((priority) => ({
    priority,
    items: suggestions.filter((s) => s.priority === priority),
  })).filter((g) => g.items.length > 0);
}

function scoreColorClass(score: number): string {
  if (score >= 75) return "text-[var(--arcade-score-high)]";
  if (score >= 50) return "text-[var(--arcade-score-mid)]";
  return "text-[var(--arcade-score-low)]";
}

export function MatchResults({
  result,
  selectedIds,
  onToggle,
  onSelectPriority,
}: MatchResultsProps) {
  const groups = groupByPriority(result.suggestions);

  return (
    <section className="arcade-card p-6">
      <h2 className="text-lg font-bold text-arcade-text">3. Match results</h2>
      {result.jobTitle && (
        <p className="mt-1 text-sm text-arcade-text-secondary">
          Role: {result.jobTitle}
        </p>
      )}
      <div className="mt-4 flex flex-wrap items-end gap-3">
        <span
          className={`text-5xl font-extrabold leading-none ${scoreColorClass(result.matchScore)}`}
        >
          {result.matchScore}
        </span>
        <span className="pb-2 text-sm font-medium text-arcade-text-secondary">
          / 100 match score
        </span>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-arcade-text-secondary">
        {result.summary}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {ORDER.map((p) => (
          <span
            key={p}
            className={`inline-block rounded px-2 py-0.5 text-xs font-bold uppercase ${PILL_CLASS[p]}`}
          >
            {p}
          </span>
        ))}
      </div>

      <div className="mt-6 space-y-6">
        {groups.map(({ priority, items }) => (
          <div key={priority}>
            <div className="mb-2 flex items-center justify-between gap-2">
              <h3
                className={`text-sm font-bold uppercase tracking-wide ${PILL_CLASS[priority]} rounded px-2 py-1`}
              >
                {PRIORITY_LABELS[priority]}
              </h3>
              <button
                type="button"
                onClick={() => onSelectPriority(priority)}
                className="arcade-link text-xs font-semibold text-arcade-heading-cyan underline-offset-2 hover:underline"
              >
                Select all
              </button>
            </div>
            <ul className="space-y-3">
              {items.map((s) => (
                <li key={s.id} className="arcade-suggestion-card rounded-lg p-4">
                  <label className="flex cursor-pointer gap-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(s.id)}
                      onChange={() => onToggle(s.id)}
                      className="mt-1 h-5 w-5 shrink-0 rounded border-2 border-arcade-border-cyan accent-[var(--arcade-border-pink)]"
                    />
                    <span className="flex-1 min-w-0">
                      <span className="block text-xs font-semibold text-arcade-text-muted">
                        {s.section}
                      </span>
                      <span className="mt-1 block text-sm text-arcade-text">
                        {s.reason}
                      </span>
                      <span className="mt-2 block text-xs text-arcade-text-muted line-through">
                        {s.originalText}
                      </span>
                      <span className="arcade-success-text mt-1 block text-sm font-medium">
                        {s.suggestedText}
                      </span>
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
