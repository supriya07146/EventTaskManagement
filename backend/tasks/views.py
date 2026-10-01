from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import Task
from .serializers import TaskSerializer

from notifications.utils import create_notification


# =========================================================
# MY TASKS
# GET - Logged-in user's tasks
# =========================================================

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_tasks(request):

    tasks = Task.objects.filter(
        assigned_to=request.user
    ).order_by("-created_at")

    search = request.GET.get("search")
    status_filter = request.GET.get("status")
    priority_filter = request.GET.get("priority")

    if search:
        tasks = tasks.filter(
            title__icontains=search
        )

    if status_filter:
        tasks = tasks.filter(
            status=status_filter
        )

    if priority_filter:
        tasks = tasks.filter(
            priority=priority_filter
        )

    serializer = TaskSerializer(
        tasks,
        many=True
    )

    return Response(
        serializer.data,
        status=status.HTTP_200_OK
    )


# =========================================================
# TASK LIST
# GET  - List all tasks
# POST - Create task
# =========================================================

@api_view(["GET", "POST"])
def task_list(request):

    if request.method == "GET":

        tasks = Task.objects.all().order_by("-created_at")

        search = request.GET.get("search")
        status_filter = request.GET.get("status")
        priority_filter = request.GET.get("priority")

        if search:
            tasks = tasks.filter(
                title__icontains=search
            )

        if status_filter:
            tasks = tasks.filter(
                status=status_filter
            )

        if priority_filter:
            tasks = tasks.filter(
                priority=priority_filter
            )

        serializer = TaskSerializer(
            tasks,
            many=True
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )

    serializer = TaskSerializer(data=request.data)

    if serializer.is_valid():

        task = serializer.save()

        if task.assigned_to:
            create_notification(
                notification_type="new_task",
                title="New Task Created",
                message=f"Task '{task.title}' has been created.",
                user=task.assigned_to
            )

        return Response(
            TaskSerializer(task).data,
            status=status.HTTP_201_CREATED
        )

    return Response(
        serializer.errors,
        status=status.HTTP_400_BAD_REQUEST
    )


# =========================================================
# TASK DETAIL
# GET    - View task
# PUT    - Update task
# DELETE - Delete task
# =========================================================

@api_view(["GET", "PUT", "DELETE"])
def task_detail(request, pk):

    try:
        task = Task.objects.get(pk=pk)

    except Task.DoesNotExist:
        return Response(
            {"error": "Task not found"},
            status=status.HTTP_404_NOT_FOUND
        )

    if request.method == "GET":

        serializer = TaskSerializer(task)

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )

    if request.method == "PUT":

        old_status = task.status

        serializer = TaskSerializer(
            task,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():

            updated_task = serializer.save()

            if (
                old_status != "Completed"
                and updated_task.status == "Completed"
            ):

                if updated_task.assigned_to:
                    create_notification(
                        notification_type="task_completed",
                        title="Task Completed",
                        message=(
                            f"Task '{updated_task.title}' "
                            f"has been completed."
                        ),
                        user=updated_task.assigned_to
                    )

            else:

                if updated_task.assigned_to:
                    create_notification(
                        notification_type="task_updated",
                        title="Task Updated",
                        message=(
                            f"Task '{updated_task.title}' "
                            f"has been updated."
                        ),
                        user=updated_task.assigned_to
                    )

            return Response(
                TaskSerializer(updated_task).data,
                status=status.HTTP_200_OK
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    task_title = task.title
    assigned_user = task.assigned_to

    if assigned_user:
        create_notification(
            notification_type="task_deleted",
            title="Task Deleted",
            message=f"Task '{task_title}' has been deleted.",
            user=assigned_user
        )

    task.delete()

    return Response(
        {"message": "Task deleted successfully"},
        status=status.HTTP_200_OK
    )