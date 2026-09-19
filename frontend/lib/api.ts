export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ||
  "http://127.0.0.1:8000";

export type EventData = {
  id: string;
  name: string;
  public_token: string;
  event_date: string | null;
  cover_image_url: string;
  allow_upload: boolean;
  allow_download: boolean;
  is_active: boolean;
  photo_count: number;
  landing_url: string;
  gallery_url: string;
  qr_url: string;
};

export type PhotoData = {
  id: string;
  uploader_name: string;
  public_url: string;
  original_filename: string;
  mime_type: string;
  file_size: number;
  created_at: string;
};

async function ensureOk(response: Response) {
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.detail || `Request failed (${response.status})`);
  }
  return response;
}

export async function getEvent(token: string): Promise<EventData> {
  const response = await fetch(`${API_BASE}/api/events/${token}/`, {
    cache: "no-store",
  });
  await ensureOk(response);
  return response.json();
}

export async function getPhotos(token: string): Promise<PhotoData[]> {
  const response = await fetch(`${API_BASE}/api/events/${token}/photos/`, {
    cache: "no-store",
  });
  await ensureOk(response);
  return response.json();
}

export async function uploadPhotos(
  token: string,
  files: File[],
  uploaderName: string
) {
  const data = new FormData();
  files.forEach((file) => data.append("images", file));
  if (uploaderName.trim()) {
    data.append("uploader_name", uploaderName.trim());
  }

  const response = await fetch(
    `${API_BASE}/api/events/${token}/photos/upload/`,
    {
      method: "POST",
      body: data,
    }
  );

  await ensureOk(response);
  return response.json();
}
