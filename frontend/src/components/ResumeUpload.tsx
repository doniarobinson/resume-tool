"use client";

interface ResumeUploadProps {
  file: File | null;
  onFileChange: (file: File | null) => void;
}

export function ResumeUpload({ file, onFileChange }: ResumeUploadProps) {
  return (
    <section className="arcade-card p-6">
      <h2 className="arcade-card-heading">1. Upload resume</h2>
      <p className="mt-2 text-sm text-arcade-text-secondary">
        v1 supports DOCX only.
      </p>
      <input
        type="file"
        accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        className="mt-4 block w-full text-sm text-arcade-text-secondary file:mr-4 file:cursor-pointer file:rounded file:border-2 file:border-arcade-border-cyan file:bg-[var(--arcade-file-btn)] file:px-4 file:py-2 file:text-sm file:font-bold file:text-arcade-text file:hover:brightness-110"
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
        <p className="arcade-success-text mt-2 text-sm font-medium">
          Selected: {file.name}
        </p>
      )}
    </section>
  );
}
