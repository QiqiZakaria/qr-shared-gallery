import io
import mimetypes
import uuid
from pathlib import Path

import qrcode
from django.conf import settings
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response

from .models import Event, Photo
from .serializers import EventSerializer, PhotoSerializer
from .services import upload_image

ALLOWED_MIME_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/heic",
    "image/heif",
}
MAX_FILE_SIZE = 15 * 1024 * 1024

def get_active_event(token):
    return get_object_or_404(Event, public_token=token, is_active=True)

@api_view(["GET"])
def health(request):
    return Response({"ok": True})

@api_view(["GET"])
def event_detail(request, token):
    event = get_active_event(token)
    return Response(EventSerializer(event, context={"request": request}).data)

@api_view(["GET"])
def photo_list(request, token):
    event = get_active_event(token)
    photos = event.photos.filter(status=Photo.Status.APPROVED)
    return Response(PhotoSerializer(photos, many=True).data)

@api_view(["POST"])
@parser_classes([MultiPartParser, FormParser])
def upload_photos(request, token):
    event = get_active_event(token)

    if not event.allow_upload:
        return Response(
            {"detail": "Uploads are disabled for this gallery."},
            status=status.HTTP_403_FORBIDDEN,
        )

    files = request.FILES.getlist("images")
    uploader_name = request.data.get("uploader_name", "").strip()[:100]

    if not files:
        return Response(
            {"detail": "No images were provided."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if len(files) > 20:
        return Response(
            {"detail": "Maximum 20 images per request."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    created = []
    errors = []

    for image in files:
        mime_type = image.content_type or mimetypes.guess_type(image.name)[0] or ""

        if mime_type not in ALLOWED_MIME_TYPES:
            errors.append({"file": image.name, "error": "Unsupported image type."})
            continue

        if image.size > MAX_FILE_SIZE:
            errors.append({"file": image.name, "error": "Image is larger than 15 MB."})
            continue

        suffix = Path(image.name).suffix.lower()
        if not suffix:
            suffix = mimetypes.guess_extension(mime_type) or ".jpg"

        storage_path = (
            f"events/{event.public_token}/"
            f"{uuid.uuid4().hex}{suffix}"
        )

        try:
            image.seek(0)
            public_url = upload_image(
                path=storage_path,
                data=image.read(),
                content_type=mime_type,
            )

            photo = Photo.objects.create(
                event=event,
                uploader_name=uploader_name,
                storage_path=storage_path,
                public_url=public_url,
                original_filename=image.name[:255],
                mime_type=mime_type,
                file_size=image.size,
                status=Photo.Status.APPROVED,
            )
            created.append(PhotoSerializer(photo).data)
        except Exception as exc:
            print("UPLOAD ERROR:", repr(exc))
            errors.append({"file": image.name, "error": str(exc)})

    response_status = status.HTTP_201_CREATED if created else status.HTTP_400_BAD_REQUEST
    return Response(
        {
            "uploaded": created,
            "errors": errors,
            "uploaded_count": len(created),
            "error_count": len(errors),
        },
        status=response_status,
    )

@api_view(["GET"])
def event_qr(request, token):
    event = get_active_event(token)
    landing_url = f"{settings.FRONTEND_URL}/l/{event.public_token}"

    qr = qrcode.QRCode(
        version=None,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=12,
        border=4,
    )
    qr.add_data(landing_url)
    qr.make(fit=True)

    image = qr.make_image(fill_color="black", back_color="white")
    buffer = io.BytesIO()
    image.save(buffer, format="PNG")
    buffer.seek(0)

    response = HttpResponse(buffer.getvalue(), content_type="image/png")
    response["Content-Disposition"] = f'inline; filename="{event.public_token}-qr.png"'
    response["Cache-Control"] = "public, max-age=3600"
    return response
