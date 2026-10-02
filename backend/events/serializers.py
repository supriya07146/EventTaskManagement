from rest_framework import serializers

from .models import Event

class EventSerializer(serializers.ModelSerializer):

    created_by_name = serializers.CharField(
        source="created_by.full_name",
        read_only=True
    )

    class Meta:
        model = Event

        fields = [
            "id",
            "title",
            "description",
            "location",
            "event_date",
            "start_time",
            "end_time",
            "capacity",
            "image",
            "status",
            "created_by",
            "created_by_name",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "created_by",
            "created_by_name",
            "created_at",
            "updated_at",
        ]

    def validate(self, data):

        start_time = data.get(
            "start_time",
            getattr(self.instance, "start_time", None)
        )

        end_time = data.get(
            "end_time",
            getattr(self.instance, "end_time", None)
        )

        if start_time and end_time:
            if start_time >= end_time:
                raise serializers.ValidationError(
                    "End time must be later than start time."
                )

        return data