from rest_framework import serializers

from .models import Project, ProjectMember


class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = [
            "id",
            "name",
            "description",
            "owner",
            "status",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "owner",
            "created_at",
            "updated_at",
        ]


class ProjectMemberSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    project_name = serializers.CharField(source="project.name", read_only=True)

    class Meta:
        model = ProjectMember
        fields = [
            "id",
            "project",
            "project_name",
            "user",
            "username",
            "role",
            "joined_at",
        ]
        read_only_fields = [
            "id",
            "project_name",
            "username",
            "joined_at",
        ]