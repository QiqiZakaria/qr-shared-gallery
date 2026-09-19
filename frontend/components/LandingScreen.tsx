"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { EventData, getEvent } from "@/lib/api";

type Props = {
  token?: string;
};

const previewPhotos = [
  "from-rose-200 via-fuchsia-100 to-slate-200",
  "from-violet-300 via-rose-100 to-amber-100",
  "from-emerald-200 via-cyan-100 to-rose-100",
  "from-amber-200 via-rose-200 to-violet-200",
  "from-sky-200 via-slate-100 to-rose-200",
  "from-fuchsia-200 via-amber-100 to-emerald-100",
];

type ActionIcon = "camera" | "upload";

function Icon({ name }: { name: ActionIcon }) {
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

function ActionCard({
  href,
  icon,
  title,
  subtitle,
  dark = false,
}: {
  href?: string;
  icon: ActionIcon;
  title: string;
  subtitle: string;
  dark?: boolean;
}) {
  const classes = dark
    ? "bg-slate-950 text-white"
    : "bg-white text-slate-950 shadow-sm";

  const content = (
    <>
      <div className={dark ? "mx-auto mb-4 grid size-16 place-items-center rounded-lg bg-white/10" : "mx-auto mb-4 grid size-16 place-items-center rounded-lg bg-rose-50 text-rose-500"}>
        <Icon name={icon} />
      </div>
      <p className="text-center text-sm font-bold">{title}</p>
      <p className={dark ? "mt-1 text-center text-xs text-white/60" : "mt-1 text-center text-xs text-slate-400"}>
        {subtitle}
      </p>
    </>
  );

  if (!href) {
    return <div className={`rounded-lg p-4 opacity-70 ${classes}`}>{content}</div>;
  }

  return (
    <Link href={href} className={`rounded-lg p-4 transition active:scale-[0.98] ${classes}`}>
      {content}
    </Link>
  );
}

export default function LandingScreen({ token }: Props) {
  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(Boolean(token));
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    getEvent(token)
      .then((eventData) => {
        setEvent(eventData);
        setError("");
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Unable to load event.");
      })
      .finally(() => setLoading(false));
  }, [token]);

  const eventName = event?.name || "Muz & Dila";
  const eventDate = event?.event_date
    ? new Date(`${event.event_date}T00:00:00`).toLocaleDateString()
    : "Gallery | Sedetik";
  const galleryHref = token && event ? `/g/${token}` : undefined;
  const statusText = token
    ? `${event?.photo_count || 0} photo${event?.photo_count === 1 ? "" : "s"} shared`
    : "Scan your event QR to begin";

  return (
    <main className="min-h-dvh w-full bg-[#fff2f8] text-slate-950">
      <section className="mx-auto flex min-h-dvh w-full flex-col">
        {event?.cover_image_url && (
          <img src={event.cover_image_url} alt="" className="h-44 w-full object-cover" />
        )}

        <div className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-5 py-8 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-rose-500">
            Welcome 
          </p>
          <h1 className="mt-1 text-3xl font-bold text-slate-950">{eventName}</h1>
          <p className="mx-auto mt-2  text-sm leading-6 text-slate-500">
            Welcome to the shared photo gallery for {eventName}. This gallery is a place where you can view and share photos from the event.  
          </p>

          {loading && (
            <div className="mt-7 rounded-lg bg-white px-4 py-4 text-sm font-semibold text-slate-500 shadow-sm">
              Loading event...
            </div>
          )}

          {!loading && error && (
            <div className="mt-7 rounded-lg border border-red-100 bg-white px-4 py-4 text-sm font-semibold text-red-500">
              {error}
            </div>
          )}

          {!loading && !error && (
            <>
              <div className="mt-8 grid w-full grid-cols-2 gap-3">
                <ActionCard
                  href={galleryHref}
                  icon="camera"
                  title="Phone Camera"
                  subtitle="Take photo"
                />
                <ActionCard
                  href={galleryHref}
                  icon="upload"
                  title="From Gallery"
                  subtitle="Upload photo"
                />
              </div>

            </>
          )}

          <p className="mt-4 text-[11px] font-semibold text-slate-400">{statusText}</p>
        </div>
      </section>
    </main>
  );
}
