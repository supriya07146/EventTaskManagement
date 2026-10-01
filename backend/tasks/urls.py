from django.urls import path
from . import views


urlpatterns = [

    path(
        "my/",
        views.my_tasks,
        name="my-tasks"
    ),

    path(
        "",
        views.task_list,
        name="task-list"
    ),

    path(
        "<int:pk>/",
        views.task_detail,
        name="task-detail"
    ),
]