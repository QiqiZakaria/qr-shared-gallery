from django.contrib import admin
from django.utils.html import format_html
from .models import Event, Photo

@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ("name", "event_date", "is_active", "allow_upload", "photo_count", "public_token")
    search_fields = ("name", "public_token")
    list_filter = ("is_active", "allow_upload", "allow_download")
    readonly_fields = ("id", "public_token", "created_at", "landing_link", "qr_link")

    def photo_count(self, obj):
        return obj.photos.count()

    def landing_link(self, obj):
        from django.conf import settings
        url = f"{settings.FRONTEND_URL}/l/{obj.public_token}"
        return format_html('<a href="{}" target="_blank">{}</a>', url, url)

    def qr_link(self, obj):
        url = f"/api/events/{obj.public_token}/qr/"
        return format_html('<a href="{}" target="_blank">Open QR code</a>', url)

@admin.register(Photo)
class PhotoAdmin(admin.ModelAdmin):
    list_display = ("original_filename", "event", "uploader_name", "status", "file_size", "created_at")
    list_filter = ("status", "event")
    search_fields = ("original_filename", "uploader_name", "event__name")
    readonly_fields = ("id", "storage_path", "public_url", "mime_type", "file_size", "created_at")
