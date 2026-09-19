import secrets
import uuid
from django.db import models

def generate_public_token():
    return secrets.token_urlsafe(16)

class Event(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=160)
    public_token = models.CharField(
        max_length=64,
        unique=True,
        default=generate_public_token,
        editable=False,
        db_index=True,
    )
    event_date = models.DateField(null=True, blank=True)
    cover_image_url = models.URLField(blank=True)
    allow_upload = models.BooleanField(default=True)
    allow_download = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.name

class Photo(models.Model):
    class Status(models.TextChoices):
        APPROVED = "approved", "Approved"
        PENDING = "pending", "Pending"
        REJECTED = "rejected", "Rejected"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    event = models.ForeignKey(Event, related_name="photos", on_delete=models.CASCADE)
    uploader_name = models.CharField(max_length=100, blank=True)
    storage_path = models.CharField(max_length=500, unique=True)
    public_url = models.URLField(max_length=1000)
    original_filename = models.CharField(max_length=255)
    mime_type = models.CharField(max_length=100)
    file_size = models.PositiveBigIntegerField()
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.APPROVED,
        db_index=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.event.name} - {self.original_filename}"
