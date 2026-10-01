from django.urls import path

from .views import (
    registration_list,
    registration_detail,
    registration_status_update,
    registration_events,
    registration_users,
    my_registrations,
    cancel_my_registration,
    register_for_event,
    request_registration_otp,
    verify_registration_otp,
)

urlpatterns = [

    path(
        "request-otp/",
        request_registration_otp,
        name="request-registration-otp"
    ),

    path(
        "verify-otp/",
        verify_registration_otp,
        name="verify-registration-otp"
    ),

    path(
        "register/",
        register_for_event,
        name="register-for-event"
    ),

    path(
        "",
        registration_list,
        name="registration-list"
    ),

    path(
        "<int:pk>/",
        registration_detail,
        name="registration-detail"
    ),

    path(
        "<int:pk>/status/",
        registration_status_update,
        name="registration-status-update"
    ),

    path(
        "events/",
        registration_events,
        name="registration-events"
    ),

    path(
        "users/",
        registration_users,
        name="registration-users"
    ),

    path(
        "my/",
        my_registrations,
        name="my-registrations"
    ),

    path(
        "my/<int:pk>/cancel/",
        cancel_my_registration,
        name="cancel-my-registration"
    ),
]