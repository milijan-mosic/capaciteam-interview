from api.views import Home
from django.urls import path

urlpatterns = [
    path('upload', Home.as_view()),
    path('list', Home.as_view()),
    path('<str:file_id>/download-latest', Home.as_view()),
    path('<str:file_id>/versions/get-latest', Home.as_view()),
    path('<str:file_id>/versions/upload', Home.as_view()),
    path('<str:file_id>/versions/list', Home.as_view()),
]
