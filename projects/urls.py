from django.urls import path

from .views import (
    ProjectDetailView,
    ProjectListCreateView,
    ProjectMemberListCreateView,
    ProjectMemberDetailView,
)


urlpatterns = [
    path("", ProjectListCreateView.as_view(), name="project-list-create"),
    path("<int:pk>/", ProjectDetailView.as_view(), name="project-detail"),
    path(
        "members/",
        ProjectMemberListCreateView.as_view(),
        name="project-member-list-create",
    ),
]