"use client";

import { PhotoData } from "@/lib/api";

type Props = {
  photo: PhotoData | null;
  allowDownload: boolean;
  onClose: () => void;
};

export default function PhotoModal({
  photo,
  allowDownload,
  onClose,
}: Props) {
  if (!photo) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-3"
      onClick={onClose}
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-xl text-white backdrop-blur"
      >
        ×
      </button>

      <div
        className="flex max-h-[92vh] w-full max-w-5xl flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={photo.public_url}
          alt={photo.original_filename}
          className="max-h-[78vh] max-w-full rounded-2xl object-contain"
        />

        <div className="mt-3 flex w-full max-w-xl items-center justify-between rounded-2xl bg-white/10 px-4 py-3 text-white backdrop-blur">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">
              {photo.uploader_name || "Guest upload"}
            </p>
            <p className="text-xs text-white/60">
              {new Date(photo.created_at).toLocaleString()}
            </p>
          </div>

          {allowDownload && (
            <a
              href={photo.public_url}
              download
              target="_blank"
              rel="noreferrer"
              className="ml-3 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-950"
            >
              Download
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
