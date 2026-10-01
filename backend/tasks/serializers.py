from rest_framework import serializers
from .models import Task


class TaskSerializer(serializers.ModelSerializer):

    assigned_username = serializers.CharField(
        source="assigned_to.username",
        read_only=True
    )

    class Meta:
        model = Task
        fields = [
            "id",
            "title",
            "description",
            "assigned_to",
            "assigned_username",
            "due_date",
            "priority",
            "status",
            "created_at",
            "updated_at",
        ]