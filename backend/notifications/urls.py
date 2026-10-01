from django.urls import path
from . import views


urlpatterns = [

    path(
        '',
        views.notifications_list,
        name='notifications-list'
    ),

    path(
        '<int:pk>/',
        views.notification_detail,
        name='notification-detail'
    ),

]