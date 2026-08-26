from rest_framework import generics, permissions
from rest_framework.exceptions import PermissionDenied

from .models import Project, ProjectMember
from .serializers import ProjectMemberSerializer, ProjectSerializer


class ProjectListCreateView(generics.ListCreateAPIView):
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Project.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class ProjectDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Project.objects.filter(owner=self.request.user)


class ProjectMemberListCreateView(generics.ListCreateAPIView):
    serializer_class = ProjectMemberSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ProjectMember.objects.filter(
            project__owner=self.request.user
        )

    def perform_create(self, serializer):
        project = serializer.validated_data["project"]

        if project.owner != self.request.user:
            raise PermissionDenied(
                "You can only add members to your own projects."
            )

        serializer.save()

class ProjectMemberDetailView(
    generics.RetrieveDestroyAPIView
):
    serializer_class = ProjectMemberSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ProjectMember.objects.filter(
            project__owner=self.request.user
        )