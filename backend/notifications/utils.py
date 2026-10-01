from .models import Notification


def create_notification(
    notification_type,
    title,
    message,
    user=None
):
    return Notification.objects.create(
        notification_type=notification_type,
        title=title,
        message=message,
        user=user
    )