from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import User, RegistrationDetails, LoginDetails


@admin.register(User)
class CustomUserAdmin(UserAdmin):

    ordering = ("id",)

    list_display = (
        "id",
        "full_name",
        "email",
        "role",
        "is_active",
        "is_staff",
    )

    list_filter = (
        "role",
        "is_active",
        "is_staff",
    )

    search_fields = (
        "email",
        "full_name",
    )

    fieldsets = (
        (
            None,
            {
                "fields": (
                    "email",
                    "password",
                )
            }
        ),
        (
            "Personal Information",
            {
                "fields": (
                    "full_name",
                )
            }
        ),
        (
            "Permissions",
            {
                "fields": (
                    "role",
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                )
            }
        ),
    )

    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": (
                    "email",
                    "full_name",
                    "role",
                    "password1",
                    "password2",
                    "is_active",
                    "is_staff",
                ),
            },
        ),
    )


@admin.register(RegistrationDetails)
class RegistrationDetailsAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "full_name",
        "email",
        "role",
        "registered_at",
    )

    search_fields = (
        "full_name",
        "email",
    )

    list_filter = (
        "role",
    )


@admin.register(LoginDetails)
class LoginDetailsAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "email",
        "role",
        "login_time",
        "login_status",
    )

    search_fields = (
        "email",
    )

    list_filter = (
        "role",
        "login_status",
    )