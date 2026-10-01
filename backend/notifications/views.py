from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import Notification
from .serializers import NotificationSerializer


# =========================================================
# NOTIFICATIONS LIST
# GET - Logged-in user's notifications
# POST - Create notification
# =========================================================

@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def notifications_list(request):

    # -----------------------------------------------------
    # GET USER NOTIFICATIONS
    # -----------------------------------------------------

    if request.method == "GET":

        notifications = Notification.objects.filter(
            user=request.user
        ).order_by("-created_at")

        serializer = NotificationSerializer(
            notifications,
            many=True
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )

    # -----------------------------------------------------
    # POST
    # -----------------------------------------------------

    serializer = NotificationSerializer(
        data=request.data
    )

    if serializer.is_valid():

        notification = serializer.save()

        return Response(
            NotificationSerializer(notification).data,
            status=status.HTTP_201_CREATED
        )

    return Response(
        serializer.errors,
        status=status.HTTP_400_BAD_REQUEST
    )


# =========================================================
# NOTIFICATION DETAIL
# GET    - View notification
# PUT    - Update notification
# DELETE - Delete notification
# =========================================================

@api_view(["GET", "PUT", "DELETE"])
@permission_classes([IsAuthenticated])
def notification_detail(request, pk):

    try:

        notification = Notification.objects.get(
            pk=pk,
            user=request.user
        )

    except Notification.DoesNotExist:

        return Response(
            {
                "error": "Notification not found"
            },
            status=status.HTTP_404_NOT_FOUND
        )

    # -----------------------------------------------------
    # GET
    # -----------------------------------------------------

    if request.method == "GET":

        serializer = NotificationSerializer(
            notification
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )

    # -----------------------------------------------------
    # UPDATE
    # -----------------------------------------------------

    if request.method == "PUT":

        serializer = NotificationSerializer(
            notification,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():

            serializer.save()

            return Response(
                serializer.data,
                status=status.HTTP_200_OK
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    # -----------------------------------------------------
    # DELETE
    # -----------------------------------------------------

    notification.delete()

    return Response(
        {
            "message": "Notification deleted successfully"
        },
        status=status.HTTP_204_NO_CONTENT
    )