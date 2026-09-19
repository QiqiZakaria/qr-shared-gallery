"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  EventData,
  PhotoData,
  getEvent,
  getPhotos,
} from "@/lib/api";
import UploadPanel from "./UploadPanel";
import PhotoModal from "./PhotoModal";

export default function GalleryClient({ token }: { token: string }) {
  const [event, setEvent] = useState<EventData | null>(null);
  const [photos, setPhotos] = useState<PhotoData[]>([]);
  const [selected, setSelected] = useState<PhotoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    try {
      const [eventData, photoData] = await Promise.all([
        getEvent(token),
        getPhotos(token),
      ]);
      setEvent(eventData);
      setPhotos(photoData);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load gallery.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    refresh();
    const timer = window.setInterval(refresh, 15000);
    return () => window.clearInterval(timer);
  }, [refresh]);

  const latestText = useMemo(() => {
    if (!photos.length) return "No photos yet";
    return `${photos.length} photo${photos.length === 1 ? "" : "s"}`;
  }, [photos.length]);

  if (loading) {
    return (
      <main className="grid min-h-dvh w-full place-items-center bg-[#fff2f8] px-5 py-8 text-slate-950">
        <div className="w-full max-w-lg animate-pulse rounded-lg bg-white px-5 py-5 text-sm font-semibold text-slate-500 shadow-sm">
          Loading gallery…
        </div>
      </main>
    );
  }

  if (error || !event) {
    return (
      <main className="grid min-h-dvh w-full place-items-center bg-[#fff2f8] px-5 py-8 text-slate-950">
        <div className="w-full max-w-lg rounded-lg border border-red-100 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto grid size-14 place-items-center rounded-lg bg-red-50 text-2xl text-red-500">
            !
          </div>
          <h1 className="mt-4 text-xl font-bold">Gallery unavailable</h1>
          <p className="mt-2 text-sm text-slate-500">
            {error || "This gallery could not be found."}
          </p>
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="safe-bottom min-h-dvh w-full bg-[#fff2f8] text-slate-950">
        <section className="min-h-dvh w-full px-5 py-5 sm:px-8 lg:px-10">
          <header className="mx-auto w-full max-w-7xl">
            <div className="flex items-center justify-between gap-3">
              <Link
                href={`/l/${token}`}
                aria-label="Previous page"
                className="grid size-9 shrink-0 place-items-center rounded-full text-2xl font-light text-slate-500 transition active:scale-[0.96]"
              >
                ‹
              </Link>

              <h1 className="min-w-0 flex-1 truncate text-lg font-bold text-slate-950">
                Disposable Camera
              </h1>

              <a
                href="#gallery"
                className="shrink-0 rounded-full bg-rose-500 px-4 py-2 text-xs font-bold text-white shadow-sm transition active:scale-[0.98]"
              >
                View Gallery
              </a>
            </div>
          </header>

          <div className="mx-auto mt-10 grid w-full max-w-7xl gap-10 lg:grid-cols-[minmax(320px,440px)_minmax(0,1fr)] lg:items-start">
            <div>
              <div className="flex items-center justify-between gap-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-rose-400">
                  Disposable Camera
                </p>
                <p className="text-xs font-bold text-slate-500">{latestText}</p>
              </div>

              <h2 className="mt-3 max-w-[320px] text-3xl font-black leading-none text-slate-950 sm:text-4xl lg:text-5xl">
                Tap a camera to shoot
              </h2>
              <p className="mt-3 max-w-sm text-sm leading-6 text-slate-500">
                Swipe through the options, then tap a camera card to open your camera.
              </p>

              <div className="mt-6">
                <UploadPanel
                  token={token}
                  disabled={!event.allow_upload}
                  onUploaded={refresh}
                />
              </div>
            </div>

            <section id="gallery" className="scroll-mt-5">
              <div className="mb-4 flex items-end justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-950">
                    Upload ({photos.length})
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Your contributions appear here automatically.
                  </p>
                </div>

                <button
                  onClick={refresh}
                  className="rounded-lg bg-white px-4 py-2 text-sm font-bold text-slate-950 shadow-sm transition active:scale-[0.98]"
                >
                  Refresh
                </button>
              </div>

              {!photos.length ? (
                <div className="rounded-lg border border-dashed border-rose-200 bg-white px-6 py-20 text-center shadow-sm lg:min-h-[360px]">
                  <div className="mx-auto grid size-16 place-items-center rounded-lg bg-rose-50 text-2xl text-rose-500">
                    +
                  </div>
                  <p className="mt-3 font-semibold text-slate-950">
                    Be the first to add a photo.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {photos.map((photo) => (
                    <button
                      key={photo.id}
                      type="button"
                      onClick={() => setSelected(photo)}
                      className="group relative aspect-square overflow-hidden rounded-lg bg-white shadow-sm"
                    >
                      <img
                        src={photo.public_url}
                        alt={photo.original_filename}
                        loading="lazy"
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                      />
                      {photo.uploader_name && (
                        <span className="absolute bottom-2 left-2 max-w-[80%] truncate rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
                          {photo.uploader_name}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </section>
          </div>
        </section>
      </main>

      <PhotoModal
        photo={selected}
        allowDownload={event.allow_download}
        onClose={() => setSelected(null)}
      />
    </>
  );
}
