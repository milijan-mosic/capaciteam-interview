from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from rest_framework.authtoken.views import obtain_auth_token

# API URLS
urlpatterns = [
    path("api/admin/", admin.site.urls),
    # API base url
    path("api/core/", include("propylon_document_manager.site.api_router")),
    # DRF auth token
    path("api/auth/", include("rest_framework.urls")),
    path("api/token/", obtain_auth_token),
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

if settings.DEBUG:
    if "debug_toolbar" in settings.INSTALLED_APPS:
        import debug_toolbar

        urlpatterns = [path("__debug__/", include(debug_toolbar.urls))] + urlpatterns
