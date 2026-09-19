"use client";

import { ChangeEvent, useRef, useState } from "react";
import { uploadPhotos } from "@/lib/api";

type Props = {
  token: string;
  disabled?: boolean;
  onUploaded: () => Promise<void> | void;
};

type UploadIcon = "camera" | "upload";

function Icon({ name }: { name: UploadIcon }) {
  if (name === "camera") {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="size-10"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      >
        <path d="M14.5 4 16 7h2.5A2.5 2.5 0 0 1 21 9.5v7A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5v-7A2.5 2.5 0 0 1 5.5 7H8l1.5-3h5Z" />
        <circle cx="12" cy="13" r="3.5" />
      </svg>
    );
  }

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-10"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    >
      <path d="M12 15V4" />
      <path d="m7 9 5-5 5 5" />
      <path d="M5 15v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3" />
    </svg>
  );
}

export default function UploadPanel({ token, disabled, onUploaded }: Props) {
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const [uploaderName, setUploaderName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []);
    event.target.value = "";

    if (!files.length) return;

    setUploading(true);
    setMessage("");

    try {
      const result = await uploadPhotos(token, files, uploaderName);
      const success = result.uploaded_count || 0;
      const errors = result.error_count || 0;

      setMessage(
        errors
          ? `${success} uploaded, ${errors} failed.`
          : `${success} photo${success === 1 ? "" : "s"} uploaded.`
      );
      await onUploaded();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <section>
      <label className="mb-2 block text-sm font-bold text-slate-950">
        Your name <span className="font-normal text-slate-400">(optional)</span>
      </label>

      <input
        value={uploaderName}
        onChange={(e) => setUploaderName(e.target.value)}
        maxLength={100}
        placeholder="e.g. Aina"
        className="mb-4 w-full rounded-lg border border-rose-100 bg-white px-4 py-3 text-sm shadow-sm outline-none transition placeholder:text-slate-400 focus:border-rose-300"
      />

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          disabled={disabled || uploading}
          onClick={() => cameraRef.current?.click()}
          className="min-h-40 rounded-lg bg-slate-950 p-4 font-semibold text-white shadow-sm transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className="mx-auto mb-4 grid size-16 place-items-center rounded-lg bg-white/10">
            <Icon name="camera" />
          </span>
          <span className="block text-center text-sm font-bold">Take Photo</span>
        </button>

        <button
          type="button"
          disabled={disabled || uploading}
          onClick={() => galleryRef.current?.click()}
          className="min-h-40 rounded-lg bg-white p-4 font-semibold text-slate-950 shadow-sm transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className="mx-auto mb-4 grid size-16 place-items-center rounded-lg bg-rose-50 text-rose-500">
            <Icon name="upload" />
          </span>
          <span className="block text-center text-sm font-bold">Upload</span>
        </button>
      </div>

      <input
        ref={cameraRef}
        className="hidden"
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFiles}
      />

      <input
        ref={galleryRef}
        className="hidden"
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
        multiple
        onChange={handleFiles}
      />

      {uploading && (
        <div className="mt-4 rounded-lg bg-white px-4 py-3 text-sm font-semibold text-slate-500 shadow-sm">
          Uploading…
        </div>
      )}

      {!uploading && message && (
        <div className="mt-4 rounded-lg bg-white px-4 py-3 text-sm font-semibold text-slate-500 shadow-sm">
          {message}
        </div>
      )}
    </section>
  );
}
