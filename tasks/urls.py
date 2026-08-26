from django.urls import path

from .views import (
    ProjectBoardView,
    TaskDetailView,
    TaskListCreateView,
)


urlpatterns = [
    path("", TaskListCreateView.as_view(), name="task-list-create"),
    path("board/", ProjectBoardView.as_view(), name="project-board"),
    path("<int:pk>/", TaskDetailView.as_view(), name="task-detail"),
]