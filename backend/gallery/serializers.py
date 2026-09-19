from rest_framework import serializers
from .models import Event, Photo

class PhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Photo
        fields = [
            "id",
            "uploader_name",
            "public_url",
            "original_filename",
            "mime_type",
            "file_size",
            "created_at",
        ]

class EventSerializer(serializers.ModelSerializer):
    photo_count = serializers.SerializerMethodField()
    landing_url = serializers.SerializerMethodField()
    gallery_url = serializers.SerializerMethodField()
    qr_url = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = [
            "id",
            "name",
            "public_token",
            "event_date",
            "cover_image_url",
            "allow_upload",
            "allow_download",
            "is_active",
            "photo_count",
            "landing_url",
            "gallery_url",
            "qr_url",
        ]

    def get_photo_count(self, obj):
        return obj.photos.filter(status=Photo.Status.APPROVED).count()

    def get_landing_url(self, obj):
        from django.conf import settings
        return f"{settings.FRONTEND_URL}/l/{obj.public_token}"

    def get_gallery_url(self, obj):
        from django.conf import settings
        return f"{settings.FRONTEND_URL}/g/{obj.public_token}"

    def get_qr_url(self, obj):
        request = self.context.get("request")
        path = f"/api/events/{obj.public_token}/qr/"
        return request.build_absolute_uri(path) if request else path
