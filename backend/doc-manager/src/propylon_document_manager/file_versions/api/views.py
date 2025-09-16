from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from ..models import FileVersion
from .serializers import FileVersionSerializer


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def upload_new_file(request):
    serializer = FileVersionSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save(owner=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_all_files(request):
    files = FileVersion.objects.filter(owner=request.user)

    serializer = FileVersionSerializer(files, many=True)

    return Response(serializer.data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def download_file(request, file_id):
    try:
        file = FileVersion.objects.get(id=file_id, owner=request.user)
    except FileVersion.DoesNotExist:
        return Response({"error": "Not found"}, status=status.HTTP_404_NOT_FOUND)

    serializer = FileVersionSerializer(file)

    return Response(serializer.data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_last_file_version(request, file_id):
    try:
        file = FileVersion.objects.get(id=file_id, owner=request.user)
    except FileVersion.DoesNotExist:
        return Response({"error": "Not found"}, status=status.HTTP_404_NOT_FOUND)

    serializer = FileVersionSerializer(file)

    return Response(serializer.data)


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def upload_new_file_version(request, file_id):
    serializer = FileVersionSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save(owner=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_all_file_versions(request, file_id):
    files = FileVersion.objects.filter(owner=request.user, id=file_id)

    serializer = FileVersionSerializer(files, many=True)

    return Response(serializer.data)
