import uuid

from django.db import models


class FileVersion(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    #
    name = models.CharField(max_length=255)
    url = models.URLField()
    version = models.PositiveIntegerField()
    #
    content = models.BinaryField()
    #
    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-version"]

    def get_download_url(self):
        from django.urls import reverse

        return reverse("file_download", args=[str(self.id)])
