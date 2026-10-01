from django.contrib import admin

from .models import Registration


@admin.register(Registration)
class RegistrationAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "user",
        "event",
        "status",
        "registered_at",
        "updated_at",
    )

    list_filter = (
        "status",
        "event",
        "registered_at",
    )

    search_fields = (
        "user__username",
        "user__email",
        "event__title",
    )

    ordering = (
        "-registered_at",
    )