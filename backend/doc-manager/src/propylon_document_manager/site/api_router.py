from django.conf import settings
from django.urls import path
from rest_framework.routers import DefaultRouter, SimpleRouter

from propylon_document_manager.file_versions.api import views

if settings.DEBUG:
    router = DefaultRouter()
else:
    router = SimpleRouter()

urlpatterns = [
    path('upload', views.upload_new_file),
    path('list', views.list_all_files),
    path('<str:file_id>/download-latest', views.download_file),
    path('<str:file_id>/versions/get-latest', views.get_last_file_version),
    path('<str:file_id>/versions/upload', views.upload_new_file_version),
    path('<str:file_id>/versions/list', views.list_all_file_versions),
]
