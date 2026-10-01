import random

from datetime import timedelta

from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings

from django.db.models import Q

from rest_framework.decorators import (
    api_view,
    permission_classes
)
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import Registration,RegistrationOTP
from .serializers import RegistrationSerializer

from accounts.models import User

from notifications.utils import create_notification


# =========================================================
# ADMIN CHECK
# =========================================================

def check_admin(request):

    if not request.user.is_authenticated:
        return Response(
            {"error": "Authentication required"},
            status=status.HTTP_401_UNAUTHORIZED
        )

    if not request.user.is_staff:
        return Response(
            {"error": "Admin access required"},
            status=status.HTTP_403_FORBIDDEN
        )

    return None


# =========================================================
# REGISTRATION LIST
# GET
# =========================================================

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def registration_list(request):

    admin_error = check_admin(request)

    if admin_error:
        return admin_error

    registrations = Registration.objects.select_related(
        "event",
        "user"
    ).all()

    # -----------------------------------------------------
    # SEARCH
    # -----------------------------------------------------

    search = request.GET.get("search")

    if search:

        registrations = registrations.filter(
            Q(event__title__icontains=search)
            | Q(user__email__icontains=search)
            | Q(user__full_name__icontains=search)
        )

    # -----------------------------------------------------
    # EVENT FILTER
    # -----------------------------------------------------

    event_id = request.GET.get("event")

    if event_id:
        registrations = registrations.filter(
            event_id=event_id
        )

    # -----------------------------------------------------
    # USER FILTER
    # -----------------------------------------------------

    user_id = request.GET.get("user")

    if user_id:
        registrations = registrations.filter(
            user_id=user_id
        )

    # -----------------------------------------------------
    # STATUS FILTER
    # -----------------------------------------------------

    status_filter = request.GET.get("status")

    if status_filter:
        registrations = registrations.filter(
            status=status_filter
        )

    serializer = RegistrationSerializer(
        registrations,
        many=True
    )

    return Response(
        serializer.data,
        status=status.HTTP_200_OK
    )


# =========================================================
# REGISTRATION DETAIL
# GET
# =========================================================

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def registration_detail(request, pk):

    admin_error = check_admin(request)

    if admin_error:
        return admin_error

    try:
        registration = Registration.objects.select_related(
            "event",
            "user"
        ).get(pk=pk)

    except Registration.DoesNotExist:
        return Response(
            {"error": "Registration not found"},
            status=status.HTTP_404_NOT_FOUND
        )

    serializer = RegistrationSerializer(registration)

    return Response(
        serializer.data,
        status=status.HTTP_200_OK
    )


# =========================================================
# REGISTRATION STATUS UPDATE
# PATCH
# =========================================================

@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def registration_status_update(request, pk):

    admin_error = check_admin(request)

    if admin_error:
        return admin_error

    try:
        registration = Registration.objects.select_related(
            "event",
            "user"
        ).get(pk=pk)

    except Registration.DoesNotExist:
        return Response(
            {"error": "Registration not found"},
            status=status.HTTP_404_NOT_FOUND
        )

    new_status = request.data.get("status")

    allowed_statuses = [
        "pending",
        "approved",
        "rejected",
        "cancelled"
    ]

    if new_status not in allowed_statuses:
        return Response(
            {
                "error": (
                    "Invalid status. "
                    "Allowed values are: "
                    "pending, approved, rejected, cancelled."
                )
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    registration.status = new_status
    registration.save()

    # -----------------------------------------------------
    # NOTIFICATION
    # -----------------------------------------------------

    create_notification(
        notification_type="registration_updated",
        title="Registration Updated",
        message=(
            f"Registration for "
            f"'{registration.event.title}' "
            f"has been changed to "
            f"'{registration.get_status_display()}'."
        ),
        user=registration.user
    )

    serializer = RegistrationSerializer(registration)

    return Response(
        serializer.data,
        status=status.HTTP_200_OK
    )


# =========================================================
# REGISTRATION EVENTS
# GET
# =========================================================

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def registration_events(request):

    admin_error = check_admin(request)

    if admin_error:
        return admin_error

    from events.models import Event

    events = Event.objects.all().order_by("-event_date")

    data = [
        {
            "id": event.id,
            "title": event.title
        }
        for event in events
    ]

    return Response(
        data,
        status=status.HTTP_200_OK
    )


# =========================================================
# REGISTRATION USERS
# GET
# =========================================================

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def registration_users(request):

    admin_error = check_admin(request)

    if admin_error:
        return admin_error

    users = User.objects.filter(
        is_staff=False
    ).order_by("full_name")

    data = [
        {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email
        }
        for user in users
    ]

    return Response(
        data,
        status=status.HTTP_200_OK
    )

# =========================================================
# USER MY REGISTRATIONS
# GET
# =========================================================

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_registrations(request):

    registrations = Registration.objects.select_related(
        "event"
    ).filter(
        user=request.user
    ).order_by("-registered_at")

    # -----------------------------------------------------
    # SEARCH
    # -----------------------------------------------------

    search = request.GET.get("search")

    if search:
        registrations = registrations.filter(
            Q(event__title__icontains=search)
        )

    # -----------------------------------------------------
    # STATUS FILTER
    # -----------------------------------------------------

    status_filter = request.GET.get("status")

    if status_filter:
        registrations = registrations.filter(
            status=status_filter
        )

    serializer = RegistrationSerializer(
        registrations,
        many=True
    )

    return Response(
        serializer.data,
        status=status.HTTP_200_OK
    )


# =========================================================
# USER CANCEL REGISTRATION
# PATCH
# =========================================================

@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def cancel_my_registration(request, pk):

    try:
        registration = Registration.objects.select_related(
            "event"
        ).get(
            pk=pk,
            user=request.user
        )

    except Registration.DoesNotExist:

        return Response(
            {
                "error": "Registration not found"
            },
            status=status.HTTP_404_NOT_FOUND
        )

    # -----------------------------------------------------
    # ALREADY CANCELLED
    # -----------------------------------------------------

    if registration.status == "cancelled":

        return Response(
            {
                "error": "Registration is already cancelled."
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    # -----------------------------------------------------
    # CANCEL
    # -----------------------------------------------------

    registration.status = "cancelled"
    registration.save()

    # -----------------------------------------------------
    # NOTIFICATION
    # -----------------------------------------------------

    create_notification(
        notification_type="registration_updated",
        title="Registration Cancelled",
        message=(
            f"Your registration for "
            f"'{registration.event.title}' "
            f"has been cancelled."
        ),
        user=request.user
    )

    serializer = RegistrationSerializer(
        registration
    )

    return Response(
        serializer.data,
        status=status.HTTP_200_OK
    )

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def register_for_event(request):

    event_id = request.data.get("event")

    if not event_id:
        return Response(
            {"error": "Event ID is required."},
            status=status.HTTP_400_BAD_REQUEST
        )

    from events.models import Event

    try:
        event = Event.objects.get(pk=event_id)
    except Event.DoesNotExist:
        return Response(
            {"error": "Event not found."},
            status=status.HTTP_404_NOT_FOUND
        )

    if event.status in ["completed", "cancelled"]:
        return Response(
            {"error": "You cannot register for this event."},
            status=status.HTTP_400_BAD_REQUEST
        )

    already_registered = Registration.objects.filter(
        event=event,
        user=request.user
    ).exists()

    if already_registered:
        return Response(
            {"error": "You are already registered for this event."},
            status=status.HTTP_400_BAD_REQUEST
        )

    registration = Registration.objects.create(
        event=event,
        user=request.user
    )

    create_notification(
        notification_type="registration_created",
        title="Event Registration",
        message=(
            f"You have successfully registered for "
            f"'{event.title}'."
        ),
        user=request.user
    )

    serializer = RegistrationSerializer(registration)

    return Response(
        serializer.data,
        status=status.HTTP_201_CREATED
    )

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def request_registration_otp(request):

    event_id = request.data.get("event")
    name = request.data.get("name")
    email = request.data.get("email")
    phone = request.data.get("phone")

    if not event_id:
        return Response(
            {"error": "Event ID is required."},
            status=status.HTTP_400_BAD_REQUEST
        )

    if not name or not email or not phone:
        return Response(
            {
                "error": "Name, email and phone number are required."
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    from events.models import Event

    try:
        event = Event.objects.get(pk=event_id)

    except Event.DoesNotExist:
        return Response(
            {"error": "Event not found."},
            status=status.HTTP_404_NOT_FOUND
        )

    if event.status in ["completed", "cancelled"]:
        return Response(
            {
                "error": "You cannot register for this event."
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    already_registered = Registration.objects.filter(
        event=event,
        user=request.user
    ).exists()

    if already_registered:
        return Response(
            {
                "error": "You are already registered for this event."
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    otp = str(random.randint(100000, 999999))

    expires_at = timezone.now() + timedelta(minutes=5)

    RegistrationOTP.objects.filter(
        event=event,
        user=request.user,
        is_verified=False
    ).delete()

    verification = RegistrationOTP.objects.create(
        event=event,
        user=request.user,
        name=name,
        email=email,
        phone=phone,
        otp=otp,
        expires_at=expires_at
    )

    send_mail(
        subject=f"EventFlow - Registration OTP for {event.title}",

        message=(
            f"Hello {name},\n\n"
            f"Your OTP for registering for "
            f"'{event.title}' is:\n\n"
            f"{otp}\n\n"
            f"This OTP is valid for 5 minutes.\n\n"
            f"Please do not share this OTP with anyone.\n\n"
            f"Regards,\n"
            f"EventFlow Team"
        ),

        from_email=settings.DEFAULT_FROM_EMAIL,

        recipient_list=[email],

        fail_silently=False
    )

    return Response(
        {
            "message": "OTP sent successfully.",
            "verification_id": verification.id
        },
        status=status.HTTP_200_OK
    )

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def verify_registration_otp(request):

    verification_id = request.data.get("verification_id")
    entered_otp = request.data.get("otp")

    if not verification_id or not entered_otp:
        return Response(
            {
                "error": "Verification ID and OTP are required."
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        verification = RegistrationOTP.objects.select_related(
            "event",
            "user"
        ).get(
            id=verification_id,
            user=request.user
        )

    except RegistrationOTP.DoesNotExist:
        return Response(
            {
                "error": "OTP verification request not found."
            },
            status=status.HTTP_404_NOT_FOUND
        )

    if verification.is_verified:
        return Response(
            {
                "error": "OTP has already been verified."
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    if timezone.now() > verification.expires_at:
        return Response(
            {
                "error": "OTP has expired. Please request a new OTP."
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    if str(entered_otp) != verification.otp:
        return Response(
            {
                "error": "Invalid OTP."
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    already_registered = Registration.objects.filter(
        event=verification.event,
        user=request.user
    ).exists()

    if already_registered:
        return Response(
            {
                "error": "You are already registered for this event."
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    registration = Registration.objects.create(
        event=verification.event,
        user=request.user
    )

    verification.is_verified = True
    verification.save(update_fields=["is_verified"])

    create_notification(
        notification_type="registration_created",
        title="Event Registration",
        message=(
            f"You have successfully registered for "
            f"'{verification.event.title}'."
        ),
        user=request.user
    )

    return Response(
        {
            "message": "Registration successful.",
            "registration_id": registration.id
        },
        status=status.HTTP_201_CREATED
    )