# TaskFlow

## AI Project Management Platform

TaskFlow is a full-stack project management platform built with Django and Django REST Framework. It helps individuals and teams organize projects, manage tasks, assign responsibilities, track progress, and collaborate through a visual project board.

## Features

- User registration and authentication
- Secure login and logout
- User-specific projects and tasks
- Create, view, edit, and delete projects
- Individual and team-based projects
- Select project team members
- Display project team members
- Create and assign tasks
- Task status management
- Task priority management
- Due-date support
- Kanban-style project board
- Project-specific task tracking
- REST API endpoints
- Django administration panel

## Technology Stack

### Backend
- Python
- Django
- Django REST Framework
- SQLite

### Frontend
- HTML5
- CSS3
- JavaScript

### Authentication
- Django Authentication System
- Custom Django User Model

## Project Structure

```text
TaskFlow/
├── accounts/
├── comments/
├── projects/
├── tasks/
├── frontend/
├── templates/
├── project_management/
├── manage.py
└── README.md

Main Modules
Accounts

Handles:

User registration
Login
Logout
Custom user model
Projects

Handles:

Project creation
Project ownership
Project status
Project members
Project details
Project management
Tasks

Handles:

Task creation
Task assignment
Task priority
Task status
Due dates
Project board
Comments

Provides project/task collaboration functionality through comments.

Task Workflow

Tasks can move through the following workflow:

To Do
  ↓
In Progress
  ↓
Review
  ↓
Done
Running the Project Locally
1. Clone the repository
git clone https://github.com/Soumya0481/TaskFlow.git
cd TaskFlow
2. Create a virtual environment

Windows:

python -m venv .venv
3. Activate the virtual environment
.venv\Scripts\activate
4. Install dependencies
pip install django djangorestframework
5. Apply migrations
python manage.py migrate
6. Start the development server
python manage.py runserver

Open:

http://127.0.0.1:8000/
API Endpoints
Projects
GET/POST /api/projects/
GET/PATCH/DELETE /api/projects/<id>/
Project Members
GET/POST /api/projects/members/
Tasks
GET/POST /api/tasks/
GET/PATCH/DELETE /api/tasks/<id>/
Comments
/api/comments/
Project Highlights

TaskFlow demonstrates a complete full-stack workflow combining:

Frontend
   ↓
JavaScript
   ↓
Django REST API
   ↓
Django Models
   ↓
Database

The platform supports both individual projects and collaborative team projects.

Future Enhancements
AI-powered task estimation
AI project risk prediction
Smart task prioritization
Automated project progress insights
AI-generated project summaries
Notifications and reminders
Advanced analytics dashboard
Real-time team collaboration
Author

Soumya

GitHub:
https://github.com/Soumya0481