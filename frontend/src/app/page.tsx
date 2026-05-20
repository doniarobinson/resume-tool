"use client";

import { useMemo, useState } from "react";
import { JobInput } from "@/components/JobInput";
import { MatchResults } from "@/components/MatchResults";
import { ResumeUpload } from "@/components/ResumeUpload";
import {
  analyzeResume,
  applySuggestions,
  type AnalyzeResult,
  type Priority,
  type Suggestion,
} from "@/lib/api";

export default function Home() {
  const [resume, setResume] = useState<File | null>(null);
  const [jobUrl, setJobUrl] = useState("");
  const [jobText, setJobText] = useState("");
  const [result, setResult] = useState<AnalyzeResult | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canAnalyze = useMemo(() => {
    const hasJob = jobUrl.trim().length > 0 || jobText.trim().length >= 50;
    return Boolean(resume && hasJob);
  }, [resume, jobUrl, jobText]);

  async function handleAnalyze() {
    if (!resume) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setSelectedIds(new Set());
    try {
      const data = await analyzeResume(resume, jobUrl, jobText);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed.");
    } finally {
      setLoading(false);
    }
  }

  function toggleSuggestion(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectPriority(priority: Priority) {
    if (!result) return;
    setSelectedIds((prev) => {
      const next = new Set(prev);
      for (const s of result.suggestions) {
        if (s.priority === priority) next.add(s.id);
      }
      return next;
    });
  }

  async function handleApply() {
    if (!resume || !result || selectedIds.size === 0) return;
    setApplying(true);
    setError(null);
    try {
      const blob = await applySuggestions(
        resume,
        Array.from(selectedIds),
        result.suggestions
      );
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = resume.name.replace(/\.docx$/i, "") + "-tailored.docx";
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Apply failed.");
    } finally {
      setApplying(false);
    }
  }

  return (
    <div className="min-h-full">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-6">
          <h1 className="text-2xl font-bold tracking-tight">Job Application Agent</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Score your resume against a job posting and apply selected improvements.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-6 px-4 py-8">
        <ResumeUpload file={resume} onFileChange={setResume} />
        <JobInput
          jobUrl={jobUrl}
          jobText={jobText}
          onJobUrlChange={setJobUrl}
          onJobTextChange={setJobText}
        />

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            disabled={!canAnalyze || loading}
            onClick={handleAnalyze}
            className="rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40 hover:bg-zinc-700"
          >
            {loading ? "Analyzing…" : "Analyze match"}
          </button>
        </div>

        {error && (
          <p className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            {error}
          </p>
        )}

        {result && (
          <>
            <MatchResults
              result={result}
              selectedIds={selectedIds}
              onToggle={toggleSuggestion}
              onSelectPriority={selectPriority}
            />
            <div className="flex justify-end">
              <button
                type="button"
                disabled={selectedIds.size === 0 || applying}
                onClick={handleApply}
                className="rounded-lg bg-emerald-700 px-5 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40 hover:bg-emerald-600"
              >
                {applying
                  ? "Generating…"
                  : `Apply ${selectedIds.size} change${selectedIds.size === 1 ? "" : "s"} & download DOCX`}
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
