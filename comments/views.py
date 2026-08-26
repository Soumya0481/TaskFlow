from rest_framework import generics, permissions
from rest_framework.exceptions import PermissionDenied

from .models import Comment
from .serializers import CommentSerializer


class CommentListCreateView(generics.ListCreateAPIView):
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Comment.objects.filter(
            task__project__owner=self.request.user
        ).select_related(
            "task",
            "author",
        )

    def perform_create(self, serializer):
        task = serializer.validated_data["task"]

        if task.project.owner != self.request.user:
            raise PermissionDenied(
                "You can only comment on tasks in your own projects."
            )

        serializer.save(author=self.request.user)