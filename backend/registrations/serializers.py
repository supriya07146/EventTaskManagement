from rest_framework import serializers
from .models import Registration


class RegistrationSerializer(serializers.ModelSerializer):

    user_name = serializers.CharField(
        source="user.full_name",
        read_only=True
    )

    user_email = serializers.EmailField(
        source="user.email",
        read_only=True
    )

    event_title = serializers.CharField(
        source="event.title",
        read_only=True
    )

    event_location = serializers.CharField(
        source="event.location",
        read_only=True
    )

    event_date = serializers.DateField(
        source="event.event_date",
        read_only=True
    )

    start_time = serializers.TimeField(
        source="event.start_time",
        read_only=True
    )

    end_time = serializers.TimeField(
        source="event.end_time",
        read_only=True
    )

    status_display = serializers.SerializerMethodField()

    class Meta:
        model = Registration

        fields = [
            "id",

            "event",
            "event_title",
            "event_location",
            "event_date",
            "start_time",
            "end_time",

            "user",
            "user_name",
            "user_email",

            "status",
            "status_display",

            "registered_at",
            "updated_at",
        ]

    def get_status_display(self, obj):
        return obj.get_status_display()