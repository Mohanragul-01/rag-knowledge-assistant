// File: src/components/FileUpload.tsx
// Purpose: PDF drag-and-drop uploader — calls /upload and reports status to parent
// Step: Step-7 — React UI

import { useRef, useState } from "react";
import type { DragEvent, ChangeEvent } from "react";
import { uploadPDF } from "../api/client";


interface Props {
  onUploaded: (filename: string, chunks: number) => void;
}


export default function FileUpload({ onUploaded }: Props) {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);


  // ── Shared upload handler ──────────────────────────────────────────────────
  async function handleFile(file: File) {
    if (!file.name.endsWith(".pdf")) {
      setStatus("error");
      setMessage("Only PDF files are supported.");
      return;
    }

    setStatus("loading");
    setMessage(`Uploading ${file.name}…`);

    try {
      const res = await uploadPDF(file);
      setStatus("done");
      setMessage(`✓ ${res.chunks_stored} chunks indexed from ${res.filename}`);
      onUploaded(res.filename, res.chunks_stored);
    } catch {
      setStatus("error");
      setMessage("Upload failed — is Flask running on port 5000?");
    }
  }


  // ── Drag-and-drop handlers ─────────────────────────────────────────────────
  function onDrop(e: DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function onInputChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }


  // ── Status colour helper ───────────────────────────────────────────────────
  const statusColour = {
    idle: "text-cosmic-400 dark:text-cosmic-500",
    loading: "text-cosmic-500 dark:text-cosmic-400",
    done: "text-emerald-600 dark:text-emerald-400",
    error: "text-red-500 dark:text-red-400",
  }[status];


  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      className={`card cursor-pointer select-none p-6 text-center transition-all
        ${
          dragging
            ? "border-cosmic-400 bg-cosmic-50 dark:border-cosmic-500 dark:bg-void-700"
            : "hover:border-cosmic-300 dark:hover:border-cosmic-600"
        }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={onInputChange}
      />

      {/* Upload icon */}
      <div className="mb-3 text-3xl">📄</div>

      <p className="text-sm font-medium text-cosmic-700 dark:text-cosmic-300">
        Drop a PDF here or click to browse
      </p>
      {message && (
        <p className={`mt-2 text-xs font-mono ${statusColour}`}>{message}</p>
      )}
    </div>
  );
}
