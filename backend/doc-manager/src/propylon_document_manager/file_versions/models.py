import uuid

from django.conf import settings
from django.db import models


class FileVersion(models.Model):
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
    )
    #
    #
    #
    #
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="file_versions",
        null=True,
        blank=True,
    )
    #
    #
    #
    #
    name = models.CharField(
        max_length=255,
        blank=False,
        null=False,
    )
    url = models.CharField(
        max_length=255,
        blank=True,
        null=True,
    )
    version = models.PositiveIntegerField(default=1)
    #
    #
    #
    #
    # content = models.BinaryField(
    #     blank=True,
    #     null=True,
    # )
    #
    #
    #
    #
    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-version"]

    def __str__(self):
        return f"{self.name} (v{self.version})"

    def get_download_url(self):
        from django.urls import reverse

        return reverse("file_download", args=[str(self.id)])
