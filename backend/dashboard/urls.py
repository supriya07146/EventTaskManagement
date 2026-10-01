from django.urls import path

from .views import dashboard, user_dashboard, public_stats


urlpatterns = [
    path("", dashboard, name="dashboard"),
    path("user/", user_dashboard, name="user-dashboard"),
    path("public-stats/", public_stats, name="public-stats"),
]