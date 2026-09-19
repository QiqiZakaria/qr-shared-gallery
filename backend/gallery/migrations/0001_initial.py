import gallery.models
import uuid
from django.db import migrations, models
import django.db.models.deletion

class Migration(migrations.Migration):
    initial = True
    dependencies = []

    operations = [
        migrations.CreateModel(
            name="Event",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("name", models.CharField(max_length=160)),
                ("public_token", models.CharField(db_index=True, default=gallery.models.generate_public_token, editable=False, max_length=64, unique=True)),
                ("event_date", models.DateField(blank=True, null=True)),
                ("cover_image_url", models.URLField(blank=True)),
                ("allow_upload", models.BooleanField(default=True)),
                ("allow_download", models.BooleanField(default=True)),
                ("is_active", models.BooleanField(default=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
            ],
            options={"ordering": ["-created_at"]},
        ),
        migrations.CreateModel(
            name="Photo",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("uploader_name", models.CharField(blank=True, max_length=100)),
                ("storage_path", models.CharField(max_length=500, unique=True)),
                ("public_url", models.URLField(max_length=1000)),
                ("original_filename", models.CharField(max_length=255)),
                ("mime_type", models.CharField(max_length=100)),
                ("file_size", models.PositiveBigIntegerField()),
                ("status", models.CharField(choices=[("approved", "Approved"), ("pending", "Pending"), ("rejected", "Rejected")], db_index=True, default="approved", max_length=20)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("event", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="photos", to="gallery.event")),
            ],
            options={"ordering": ["-created_at"]},
        ),
    ]
