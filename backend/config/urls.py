from django.contrib import admin
from django.urls import path, include

from rest_framework_simplejwt.views import TokenRefreshView

from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [

    path("admin/", admin.site.urls),

    path("api/", include("accounts.urls")),

    path(
        "api/token/refresh/",
        TokenRefreshView.as_view(),
        name="token_refresh"
    ),

    path(
        "api/events/",
        include("events.urls")
    ),

    path(
        "api/tasks/", 
        include("tasks.urls")
    ),

    path(
    "api/categories/",
    include("categories.urls")
    ),

    path(
    "api/registrations/",
    include("registrations.urls")
    ),

    path(
    'api/notifications/',
    include('notifications.urls')
    ),

    path(
        "api/dashboard/", 
        include("dashboard.urls")
    ),

]

if settings.DEBUG:
    urlpatterns += static(
        settings.MEDIA_URL,
        document_root=settings.MEDIA_ROOT
    )
