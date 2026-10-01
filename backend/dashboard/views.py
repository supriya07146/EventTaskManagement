from django.utils import timezone

from rest_framework.decorators import (
    api_view,
    authentication_classes,
    permission_classes,
)
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from accounts.models import User
from events.models import Event
from tasks.models import Task
from registrations.models import Registration
from notifications.models import Notification


# =========================================================
# PUBLIC STATISTICS (landing page)
# GET - Totals only, no login needed
# =========================================================

@api_view(["GET"])
@authentication_classes([])
@permission_classes([AllowAny])
def public_stats(request):

    return Response(
        {
            "total_users": User.objects.count(),
            "total_events": Event.objects.count(),
            "total_tasks": Task.objects.count(),
            "total_registrations": Registration.objects.count(),
        },
        status=status.HTTP_200_OK
    )


# =========================================================
# ADMIN DASHBOARD
# GET - Dashboard statistics and recent activities
# =========================================================

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def dashboard(request):

    # -----------------------------------------------------
    # ADMIN CHECK
    # -----------------------------------------------------

    if not request.user.is_staff:
        return Response(
            {"error": "Admin access required"},
            status=status.HTTP_403_FORBIDDEN
        )

    # -----------------------------------------------------
    # TOTAL COUNTS
    # -----------------------------------------------------

    total_users = User.objects.count()

    total_events = Event.objects.count()

    total_tasks = Task.objects.count()

    total_registrations = Registration.objects.count()

    # -----------------------------------------------------
    # RECENT ACTIVITIES
    # -----------------------------------------------------

    activities = []

    # -----------------------------------------------------
    # USERS
    # -----------------------------------------------------

    users = User.objects.all().order_by("-created_at")[:5]

    for user in users:

        activities.append({
            "type": "user",
            "title": "New User",
            "message": f"{user.full_name} registered.",
            "created_at": user.created_at,
        })

    # -----------------------------------------------------
    # EVENTS
    # -----------------------------------------------------

    events = Event.objects.all().order_by("-created_at")[:5]

    for event in events:

        activities.append({
            "type": "event",
            "title": "New Event",
            "message": f"Event '{event.title}' was created.",
            "created_at": event.created_at,
        })

    # -----------------------------------------------------
    # TASKS
    # -----------------------------------------------------

    tasks = Task.objects.all().order_by("-created_at")[:5]

    for task in tasks:

        activities.append({
            "type": "task",
            "title": "New Task",
            "message": f"Task '{task.title}' was created.",
            "created_at": task.created_at,
        })

    # -----------------------------------------------------
    # REGISTRATIONS
    # -----------------------------------------------------

    registrations = Registration.objects.select_related(
        "user",
        "event"
    ).order_by("-registered_at")[:5]

    for registration in registrations:

        activities.append({
            "type": "registration",
            "title": "New Registration",
            "message": (
                f"{registration.user.full_name} registered "
                f"for '{registration.event.title}'."
            ),
            "created_at": registration.registered_at,
        })

    # -----------------------------------------------------
    # SORT ACTIVITIES
    # -----------------------------------------------------

    activities.sort(
        key=lambda activity: activity["created_at"],
        reverse=True
    )

    activities = activities[:8]

    # -----------------------------------------------------
    # FORMAT DATETIME
    # -----------------------------------------------------

    for activity in activities:

        activity["created_at"] = activity[
            "created_at"
        ].isoformat()

    # -----------------------------------------------------
    # RESPONSE
    # -----------------------------------------------------

    return Response(
        {
            "total_users": total_users,
            "total_events": total_events,
            "total_tasks": total_tasks,
            "total_registrations": total_registrations,
            "recent_activities": activities,
        },
        status=status.HTTP_200_OK
    )


# =========================================================
# USER DASHBOARD
# GET - Logged-in user's dashboard statistics
# =========================================================

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def user_dashboard(request):

    user = request.user

    today = timezone.localdate()

    # -----------------------------------------------------
    # REGISTERED EVENTS
    # -----------------------------------------------------

    registered_events = Registration.objects.filter(
        user=user
    ).count()

    # -----------------------------------------------------
    # UPCOMING EVENTS
    # -----------------------------------------------------

    upcoming_events = Event.objects.filter(
        event_date__gte=today,
        status="upcoming",
        registrations__user=user
    ).distinct().count()

    # -----------------------------------------------------
    # PENDING TASKS
    # -----------------------------------------------------

    pending_tasks = Task.objects.filter(
        assigned_to=user
    ).exclude(
        status="Completed"
    ).count()

    # -----------------------------------------------------
    # UNREAD NOTIFICATIONS
    # -----------------------------------------------------

    notifications = Notification.objects.filter(
        user=user,
        is_read=False
    ).count()

    # -----------------------------------------------------
    # RESPONSE
    # -----------------------------------------------------

    return Response(
        {
            "registered_events": registered_events,
            "upcoming_events": upcoming_events,
            "pending_tasks": pending_tasks,
            "notifications": notifications,
        },
        status=status.HTTP_200_OK
    )