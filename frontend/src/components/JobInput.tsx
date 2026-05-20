"use client";

interface JobInputProps {
  jobText: string;
  onJobTextChange: (value: string) => void;
}

export function JobInput({ jobText, onJobTextChange }: JobInputProps) {
  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-zinc-900">2. Job posting</h2>
      <p className="mt-1 text-sm text-zinc-600">
        Paste the full job description from the listing (copy from the employer site).
      </p>
      <label className="mt-4 block text-sm font-medium text-zinc-700">
        Job description
      </label>
      <textarea
        rows={10}
        placeholder="Paste the full job description here..."
        value={jobText}
        onChange={(e) => onJobTextChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
      />
      <p className="mt-2 text-xs text-zinc-500">Minimum 50 characters.</p>
    </section>
  );
}
