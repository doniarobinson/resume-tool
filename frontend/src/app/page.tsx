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
} from "@/lib/api";

export default function Home() {
  const [resume, setResume] = useState<File | null>(null);
  const [jobText, setJobText] = useState("");
  const [result, setResult] = useState<AnalyzeResult | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadKey, setUploadKey] = useState(0);

  const canAnalyze = useMemo(() => {
    return Boolean(resume && jobText.trim().length >= 50);
  }, [resume, jobText]);

  function handleReset() {
    setResume(null);
    setJobText("");
    setResult(null);
    setSelectedIds(new Set());
    setError(null);
    setUploadKey((k) => k + 1);
  }

  async function handleAnalyze() {
    if (!resume) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setSelectedIds(new Set());
    try {
      const data = await analyzeResume(resume, jobText);
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
      <header className="arcade-header mx-4 mt-6 max-w-3xl rounded-sm md:mx-auto">
        <div className="px-4 py-6 sm:px-8">
          <h1 className="arcade-title-glow text-2xl font-bold tracking-wide text-arcade-text sm:text-3xl">
            Job Application Agent
          </h1>
          <p className="mt-2 text-sm text-arcade-text-secondary">
            Score your resume · pick upgrades · download DOCX
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-6 px-4 py-8">
        <ResumeUpload
          key={uploadKey}
          file={resume}
          onFileChange={setResume}
        />
        <JobInput jobText={jobText} onJobTextChange={setJobText} />

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            disabled={!canAnalyze || loading}
            onClick={handleAnalyze}
            className="arcade-btn-primary rounded px-5 py-2.5 text-sm disabled:cursor-not-allowed"
          >
            {loading ? "Analyzing…" : "Analyze match"}
          </button>
        </div>

        {error && (
          <p
            className="arcade-error rounded px-4 py-3 text-sm"
            role="alert"
          >
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
            <div className="flex flex-wrap justify-end gap-3">
              <button
                type="button"
                disabled={applying}
                onClick={handleReset}
                className="arcade-btn-reset rounded px-5 py-2.5 text-sm"
              >
                Reset
              </button>
              <button
                type="button"
                disabled={selectedIds.size === 0 || applying}
                onClick={handleApply}
                className="arcade-btn-secondary rounded px-5 py-2.5 text-sm disabled:cursor-not-allowed"
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
