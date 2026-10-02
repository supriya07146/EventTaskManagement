from django.db import models
from django.conf import settings


from django.db import models
from accounts.models import User


class Event(models.Model):

    STATUS_CHOICES = [
        ("upcoming", "Upcoming"),
        ("ongoing", "Ongoing"),
        ("completed", "Completed"),
        ("cancelled", "Cancelled"),
    ]

    title = models.CharField(max_length=200)

    description = models.TextField(
        blank=True
    )

    location = models.CharField(
        max_length=255
    )

    event_date = models.DateField()

    start_time = models.TimeField()

    end_time = models.TimeField()

    capacity = models.PositiveIntegerField(
        default=100
    )

    image = models.ImageField(
        upload_to="event_images/",
        blank=True,
        null=True
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="upcoming"
    )

    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name="created_events"
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):
        return self.title