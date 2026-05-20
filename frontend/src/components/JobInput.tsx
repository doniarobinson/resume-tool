"use client";

interface JobInputProps {
  jobUrl: string;
  jobText: string;
  onJobUrlChange: (value: string) => void;
  onJobTextChange: (value: string) => void;
}

export function JobInput({
  jobUrl,
  jobText,
  onJobUrlChange,
  onJobTextChange,
}: JobInputProps) {
  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-zinc-900">2. Job posting</h2>
      <p className="mt-1 text-sm text-zinc-600">
        Paste a link or the full description. If the link fails, paste the text below.
      </p>
      <label className="mt-4 block text-sm font-medium text-zinc-700">
        Job URL (optional)
      </label>
      <input
        type="url"
        placeholder="https://..."
        value={jobUrl}
        onChange={(e) => onJobUrlChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
      />
      <label className="mt-4 block text-sm font-medium text-zinc-700">
        Or paste job description
      </label>
      <textarea
        rows={8}
        placeholder="Paste the full job description here..."
        value={jobText}
        onChange={(e) => onJobTextChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
      />
    </section>
  );
}
