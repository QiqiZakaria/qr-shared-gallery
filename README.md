# QR Shared Gallery

A standalone event photo gallery MVP.

## Stack

- Frontend: Next.js + React + Tailwind CSS
- Backend: Django + Django REST Framework
- Image storage: Supabase Storage
- Frontend hosting: Cloudflare Workers / Pages
- Database for MVP: SQLite locally (swap to PostgreSQL/Supabase Postgres in production)

## What it does

1. Admin creates an Event in Django Admin.
2. Each Event has one random public token.
3. Django generates one QR code for the Event.
4. Any number of guests can scan the same QR.
5. Guests can:
   - take a photo with their phone camera;
   - select one or many existing images;
   - upload to the shared event gallery;
   - view photos uploaded by other guests;
   - download individual photos.
6. Images are stored in one Supabase Storage bucket, grouped by event token.

## Project structure

```text
qr-shared-gallery/
├── backend/
└── frontend/
```

## 1. Supabase setup

Create a Supabase project.

Go to Storage and create a bucket named:

```text
event-gallery
```

For this MVP, make the bucket **Public**.

Keep these values:

- Project URL
- Service Role Key

Never put the Service Role Key in the frontend.

## 2. Backend setup

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Edit `.env`.

Then:

```bash
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

Django Admin:

```text
http://127.0.0.1:8000/admin/
```

Create an Event. After saving it, open the Event and use its `qr_url` API endpoint or visit:

```text
http://127.0.0.1:8000/api/events/<PUBLIC_TOKEN>/qr/
```

## 3. Frontend setup

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

Open:

```text
http://localhost:3000
```

An event gallery URL looks like:

```text
http://localhost:3000/g/<PUBLIC_TOKEN>
```

## 4. Cloudflare

As of September 2026, Cloudflare recommends `vinext` for new full-stack Next.js applications on Workers. This frontend is API-driven and can be deployed to Cloudflare Workers following the current Next.js guide.

Set the production frontend URL in Django:

```env
FRONTEND_URL=https://your-domain.com
```

Set the frontend API URL:

```env
NEXT_PUBLIC_API_BASE_URL=https://api.your-domain.com
```

Django itself must run on a Python host (for example Render, Railway, Fly.io, a VPS, etc.). Cloudflare can still proxy the domain in front of it.

## Production hardening to add after MVP

- PostgreSQL instead of SQLite
- Cloudflare Turnstile
- upload rate limiting
- optional moderation / approval
- private bucket + signed image URLs
- thumbnail generation
- image compression
- EXIF stripping
- report/delete workflow
- ZIP download for admins
