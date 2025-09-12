from rest_framework import viewsets

from ..models import FileVersion
from .serializers import FileVersionSerializer


class FileVersionViewSet(viewsets.ModelViewSet):
    queryset = FileVersion.objects.all()
    serializer_class = FileVersionSerializer
    lookup_field = "id"
