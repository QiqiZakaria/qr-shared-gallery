from functools import lru_cache
from django.conf import settings
from supabase import create_client

@lru_cache(maxsize=1)
def get_supabase():
    if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_ROLE_KEY:
        raise RuntimeError("Supabase environment variables are not configured.")
    return create_client(
        settings.SUPABASE_URL,
        settings.SUPABASE_SERVICE_ROLE_KEY,
    )

def upload_image(*, path: str, data: bytes, content_type: str) -> str:
    client = get_supabase()
    bucket = client.storage.from_(settings.SUPABASE_STORAGE_BUCKET)

    bucket.upload(
        path=path,
        file=data,
        file_options={
            "content-type": content_type,
            "cache-control": "3600",
            "upsert": "false",
        },
    )

    return bucket.get_public_url(path)

def remove_image(path: str):
    client = get_supabase()
    client.storage.from_(settings.SUPABASE_STORAGE_BUCKET).remove([path])
