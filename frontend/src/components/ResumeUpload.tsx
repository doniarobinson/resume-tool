"use client";

interface ResumeUploadProps {
  file: File | null;
  onFileChange: (file: File | null) => void;
}

export function ResumeUpload({ file, onFileChange }: ResumeUploadProps) {
  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-zinc-900">1. Upload resume</h2>
      <p className="mt-1 text-sm text-zinc-600">
        v1 supports DOCX only. Export PDF resumes to .docx first.
      </p>
      <input
        type="file"
        accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        className="mt-4 block w-full text-sm text-zinc-700 file:mr-4 file:rounded-lg file:border-0 file:bg-zinc-900 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-zinc-700"
        onChange={(e) => {
          const selected = e.target.files?.[0] ?? null;
          if (!selected) {
            onFileChange(null);
            return;
          }
          if (!selected.name.toLowerCase().endsWith(".docx")) {
            alert("v1 supports DOCX only — export your resume as .docx and try again.");
            e.target.value = "";
            onFileChange(null);
            return;
          }
          onFileChange(selected);
        }}
      />
      {file && (
        <p className="mt-2 text-sm text-emerald-700">Selected: {file.name}</p>
      )}
    </section>
  );
}
