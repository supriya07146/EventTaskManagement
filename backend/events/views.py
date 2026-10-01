from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import Event
from .serializers import EventSerializer

from notifications.utils import create_notification


# =========================================================
# EVENT LIST
#
# USER:
# GET -> View events
#
# ADMIN:
# GET -> View events
# POST -> Create event
# =========================================================

@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def event_list(request):

    # -----------------------------------------------------
    # USER + ADMIN CAN VIEW EVENTS
    # -----------------------------------------------------

    if request.method == "GET":

        events = Event.objects.all().order_by("-created_at")

        # Search
        search = request.GET.get("search")

        if search:
            events = events.filter(
                title__icontains=search
            )

        # Status filter
        status_filter = request.GET.get("status")

        if status_filter:
            events = events.filter(
                status=status_filter
            )

        serializer = EventSerializer(
            events,
            many=True
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )

    # -----------------------------------------------------
    # ONLY ADMIN CAN CREATE
    # -----------------------------------------------------

    if not request.user.is_staff:

        return Response(
            {"error": "Admin access required"},
            status=status.HTTP_403_FORBIDDEN
        )

    serializer = EventSerializer(
        data=request.data
    )

    if serializer.is_valid():

        event = serializer.save(
            created_by=request.user
        )

        create_notification(
            notification_type="new_event",
            title="New Event Created",
            message=f"Event '{event.title}' has been created.",
            user=request.user
        )

        return Response(
            EventSerializer(event).data,
            status=status.HTTP_201_CREATED
        )

    return Response(
        serializer.errors,
        status=status.HTTP_400_BAD_REQUEST
    )


# =========================================================
# EVENT DETAIL
#
# USER:
# GET -> View event details
#
# ADMIN:
# GET -> View
# PUT -> Update
# DELETE -> Delete
# =========================================================

@api_view(["GET", "PUT", "DELETE"])
@permission_classes([IsAuthenticated])
def event_detail(request, pk):

    try:

        event = Event.objects.get(
            pk=pk
        )

    except Event.DoesNotExist:

        return Response(
            {"error": "Event not found"},
            status=status.HTTP_404_NOT_FOUND
        )

    # -----------------------------------------------------
    # USER + ADMIN CAN VIEW DETAILS
    # -----------------------------------------------------

    if request.method == "GET":

        serializer = EventSerializer(
            event
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )

    # -----------------------------------------------------
    # ONLY ADMIN CAN UPDATE / DELETE
    # -----------------------------------------------------

    if not request.user.is_staff:

        return Response(
            {"error": "Admin access required"},
            status=status.HTTP_403_FORBIDDEN
        )

    # -----------------------------------------------------
    # UPDATE
    # -----------------------------------------------------

    if request.method == "PUT":

        old_status = event.status

        serializer = EventSerializer(
            event,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():

            updated_event = serializer.save()

            # Event cancelled
            if (
                old_status != "cancelled"
                and updated_event.status == "cancelled"
            ):

                create_notification(
                    notification_type="event_cancelled",
                    title="Event Cancelled",
                    message=(
                        f"Event '{updated_event.title}' "
                        f"has been cancelled."
                    ),
                    user=request.user
                )

            else:

                create_notification(
                    notification_type="event_updated",
                    title="Event Updated",
                    message=(
                        f"Event '{updated_event.title}' "
                        f"has been updated."
                    ),
                    user=request.user
                )

            return Response(
                EventSerializer(
                    updated_event
                ).data,
                status=status.HTTP_200_OK
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    # -----------------------------------------------------
    # DELETE
    # -----------------------------------------------------

    event_title = event.title

    create_notification(
        notification_type="event_deleted",
        title="Event Deleted",
        message=f"Event '{event_title}' has been deleted.",
        user=request.user
    )

    event.delete()

    return Response(
        {"message": "Event deleted successfully"},
        status=status.HTTP_200_OK
    )
