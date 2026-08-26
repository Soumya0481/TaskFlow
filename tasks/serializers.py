from rest_framework import serializers

from .models import Task


class TaskSerializer(serializers.ModelSerializer):
    project_name = serializers.CharField(
        source="project.name",
        read_only=True,
    )

    assigned_username = serializers.CharField(
        source="assigned_to.username",
        read_only=True,
    )

    class Meta:
        model = Task
        fields = [
            "id",
            "project",
            "project_name",
            "title",
            "description",
            "assigned_to",
            "assigned_username",
            "status",
            "priority",
            "board_position",
            "due_date",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "project_name",
            "assigned_username",
            "created_at",
            "updated_at",
        ]