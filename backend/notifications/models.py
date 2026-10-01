from django.db import models
from django.conf import settings


class Notification(models.Model):

    NOTIFICATION_TYPES = [

        # USER MANAGEMENT
        ("new_user", "New User Registered"),
        ("user_updated", "User Updated"),
        ("user_deleted", "User Deleted"),
        ("user_status", "User Status Updated"),

        # EVENT MANAGEMENT
        ("new_event", "New Event Created"),
        ("event_updated", "Event Updated"),
        ("event_deleted", "Event Deleted"),
        ("event_cancelled", "Event Cancelled"),

        # TASK MANAGEMENT
        ("new_task", "New Task Created"),
        ("task_updated", "Task Updated"),
        ("task_deleted", "Task Deleted"),
        ("task_completed", "Task Completed"),
        ("task_overdue", "Task Overdue"),

        # REGISTRATION MANAGEMENT
        ("new_registration", "New Registration"),
        ("registration_updated", "Registration Updated"),
        ("registration_deleted", "Registration Deleted"),

        # CATEGORY MANAGEMENT
        ("new_category", "New Category Created"),
        ("category_updated", "Category Updated"),
        ("category_deleted", "Category Deleted"),
    ]

    notification_type = models.CharField(
        max_length=50,
        choices=NOTIFICATION_TYPES
    )

    title = models.CharField(
        max_length=255
    )

    message = models.TextField()

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="notifications"
    )

    is_read = models.BooleanField(
        default=False
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title