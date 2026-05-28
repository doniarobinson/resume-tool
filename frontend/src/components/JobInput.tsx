"use client";

interface JobInputProps {
  jobText: string;
  onJobTextChange: (value: string) => void;
}

export function JobInput({ jobText, onJobTextChange }: JobInputProps) {
  return (
    <section className="arcade-card p-6">
      <h2 className="arcade-card-heading">2. Job posting</h2>
      <p className="mt-2 text-sm text-arcade-text-secondary">
        Paste the full job description from the listing (copy from the employer
        site).
      </p>
      <label
        htmlFor="job-description"
        className="mt-4 block text-sm font-semibold text-arcade-text"
      >
        Job description
      </label>
      <textarea
        id="job-description"
        rows={10}
        placeholder="Paste the full job description here..."
        value={jobText}
        onChange={(e) => onJobTextChange(e.target.value)}
        className="arcade-input mt-2 w-full rounded px-3 py-2 text-sm"
      />
      <p className="mt-2 text-xs text-arcade-text-muted">
        Minimum 50 characters.
      </p>
    </section>
  );
}
