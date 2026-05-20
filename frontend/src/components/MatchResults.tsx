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

function groupByPriority(suggestions: Suggestion[]) {
  return ORDER.map((priority) => ({
    priority,
    items: suggestions.filter((s) => s.priority === priority),
  })).filter((g) => g.items.length > 0);
}

export function MatchResults({
  result,
  selectedIds,
  onToggle,
  onSelectPriority,
}: MatchResultsProps) {
  const groups = groupByPriority(result.suggestions);
  const scoreColor =
    result.matchScore >= 75
      ? "text-emerald-600"
      : result.matchScore >= 50
        ? "text-amber-600"
        : "text-rose-600";

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-zinc-900">3. Match results</h2>
      {result.jobTitle && (
        <p className="mt-1 text-sm text-zinc-500">Role: {result.jobTitle}</p>
      )}
      <div className="mt-4 flex items-end gap-3">
        <span className={`text-5xl font-bold ${scoreColor}`}>
          {result.matchScore}
        </span>
        <span className="pb-2 text-zinc-500">/ 100 match score</span>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-zinc-700">{result.summary}</p>

      <div className="mt-6 space-y-6">
        {groups.map(({ priority, items }) => (
          <div key={priority}>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-800">
                {PRIORITY_LABELS[priority]}
              </h3>
              <button
                type="button"
                onClick={() => onSelectPriority(priority)}
                className="text-xs font-medium text-zinc-600 hover:text-zinc-900"
              >
                Select all
              </button>
            </div>
            <ul className="space-y-3">
              {items.map((s) => (
                <li
                  key={s.id}
                  className="rounded-lg border border-zinc-100 bg-zinc-50 p-4"
                >
                  <label className="flex cursor-pointer gap-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(s.id)}
                      onChange={() => onToggle(s.id)}
                      className="mt-1 h-4 w-4 rounded border-zinc-300"
                    />
                    <span className="flex-1">
                      <span className="block text-xs font-medium text-zinc-500">
                        {s.section}
                      </span>
                      <span className="mt-1 block text-sm text-zinc-800">
                        {s.reason}
                      </span>
                      <span className="mt-2 block text-xs text-zinc-500 line-through">
                        {s.originalText}
                      </span>
                      <span className="mt-1 block text-sm text-emerald-800">
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
