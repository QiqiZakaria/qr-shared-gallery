from django.urls import path
from . import views

urlpatterns = [
    path("health/", views.health, name="health"),
    path("events/<str:token>/", views.event_detail, name="event-detail"),
    path("events/<str:token>/photos/", views.photo_list, name="photo-list"),
    path("events/<str:token>/photos/upload/", views.upload_photos, name="photo-upload"),
    path("events/<str:token>/qr/", views.event_qr, name="event-qr"),
]
