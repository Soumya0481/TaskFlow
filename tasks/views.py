from rest_framework import generics, permissions
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Task
from .serializers import TaskSerializer


class TaskListCreateView(generics.ListCreateAPIView):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Task.objects.filter(
            project__owner=self.request.user
        ).select_related(
            "project",
            "assigned_to",
        )

    def perform_create(self, serializer):
        project = serializer.validated_data["project"]

        if project.owner != self.request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied(
                "You can only create tasks in your own projects."
            )

        serializer.save()

class TaskDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Task.objects.filter(
            project__owner=self.request.user
        ).select_related(
            "project",
            "assigned_to",
        )

class ProjectBoardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        project_id = request.query_params.get("project")

        if not project_id:
            return Response(
                {"error": "project query parameter is required."},
                status=400,
            )

        tasks = Task.objects.filter(
            project_id=project_id,
            project__owner=request.user,
        ).select_related(
            "project",
            "assigned_to",
        ).order_by(
            "status",
            "board_position",
        )

        grouped_tasks = {
            "todo": [],
            "in_progress": [],
            "review": [],
            "done": [],
        }

        for task in tasks:
            grouped_tasks[task.status].append(
                TaskSerializer(task).data
            )

        return Response({
            "project_id": int(project_id),
            "board": grouped_tasks,
        })