document.addEventListener("DOMContentLoaded", () => {

    loadDashboard();

    loadProjectOptions();

});
async function loadProjectOptions() {

    const projectSelect =
        document.getElementById("task-project");

    const boardProjectSelect =
        document.getElementById(
            "board-project-select"
        );


    try {

        const response =
            await fetch("/api/projects/");


        if (!response.ok) {
            throw new Error(
                "Failed to load projects."
            );
        }


        const projects =
            await response.json();


        // -------------------------
        // Task Project Dropdown
        // -------------------------

        if (projectSelect) {

            projectSelect.innerHTML = "";

            if (projects.length === 0) {

                projectSelect.innerHTML = `
                    <option value="">
                        No projects available
                    </option>
                `;

            } else {

                projects.forEach(project => {

                    const option =
                        document.createElement(
                            "option"
                        );

                    option.value =
                        project.id;

                    option.textContent =
                        project.name;

                    projectSelect.appendChild(
                        option
                    );

                });

            }

        }

        if (projectSelect && projects.length > 0) {

    const firstProjectId =
        projectSelect.value ||
        projects[0].id;

    projectSelect.value =
        firstProjectId;

    await populateTaskAssignees(
        firstProjectId,
        "task-assignee"
    );
}


        // -------------------------
        // Board Project Dropdown
        // -------------------------

        if (boardProjectSelect) {

            boardProjectSelect.innerHTML = "";

            if (projects.length === 0) {

                boardProjectSelect.innerHTML = `
                    <option value="">
                        No projects available
                    </option>
                `;

                return;
            }


            projects.forEach(project => {

                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    project.id;

                option.textContent =
                    project.name;

                boardProjectSelect.appendChild(
                    option
                );

            });


            // Select the first project
            const firstProject =
                projects[0];

            boardProjectSelect.value =
                firstProject.id;


            // Load its board
            loadProjectBoard(
                firstProject.id
            );

        }

    } catch (error) {

        console.error(
            "Project dropdown loading error:",
            error
        );


        if (projectSelect) {

            projectSelect.innerHTML = `
                <option value="">
                    Unable to load projects
                </option>
            `;

        }


        if (boardProjectSelect) {

            boardProjectSelect.innerHTML = `
                <option value="">
                    Unable to load projects
                </option>
            `;

        }

    }

}

const taskProjectSelect =
    document.getElementById("task-project");

if (taskProjectSelect) {

    taskProjectSelect.addEventListener(
        "change",
        async () => {

            await populateTaskAssignees(
                taskProjectSelect.value,
                "task-assignee"
            );
        }
    );
}

async function loadProjectMembers(projectId) {

    const response = await fetch(
        "/api/projects/members/"
    );

    if (!response.ok) {
        throw new Error(
            "Failed to load project members."
        );
    }

    const members =
        await response.json();

   
        return members.filter(
        member =>
            Number(member.project) ===
            Number(projectId)
    );
}


async function populateTaskAssignees(
    projectId,
    selectId,
    selectedUserId = null
) {

    const select =
        document.getElementById(selectId);

    if (!select) {
        return;
    }

    select.innerHTML = `
        <option value="">
            Select team member
        </option>
    `;

    if (!projectId) {
        return;
    }

    try {

        const members =
            await loadProjectMembers(projectId);

        if (members.length === 0) {

            select.innerHTML = `
                <option value="">
                    No team members assigned
                </option>
            `;

            return;
        }

        members.forEach(member => {

            const option =
                document.createElement("option");

            option.value =
                member.user;

            option.textContent =
                member.username;

            if (
                selectedUserId &&
                Number(selectedUserId) ===
                Number(member.user)
            ) {
                option.selected = true;
            }

            select.appendChild(option);
        });

    } catch (error) {

        console.error(
            "Task assignee loading error:",
            error
        );

        select.innerHTML = `
            <option value="">
                Unable to load team members
            </option>
        `;
    }
}

// Board Project Selector

const boardProjectSelect =
    document.getElementById(
        "board-project-select"
    );

if (boardProjectSelect) {

    boardProjectSelect.addEventListener(
        "change",
        () => {

            const projectId =
                Number(
                    boardProjectSelect.value
                );

            if (!projectId) {
                return;
            }

            loadProjectBoard(projectId);

        }
    );

}
async function loadDashboard() {

    await loadCurrentUser();
    try {
        const [projectsResponse, tasksResponse, commentsResponse] =
            await Promise.all([
                fetch("/api/projects/"),
                fetch("/api/tasks/"),
                fetch("/api/comments/")
            ]);

        if (!projectsResponse.ok ||
            !tasksResponse.ok ||
            !commentsResponse.ok) {
            throw new Error("Failed to load dashboard data.");
        }

        const projects = await projectsResponse.json();
        const tasks = await tasksResponse.json();
        const comments = await commentsResponse.json();

        renderProjects(projects);


        updateStatistics(projects, tasks);
        renderRecentTasks(tasks);
        

        console.log("Projects:", projects);
        console.log("Tasks:", tasks);
        console.log("Comments:", comments);

    } catch (error) {
        console.error("Dashboard loading error:", error);
    }

    
}
function renderProjects(projects) {

    const projectsGrid =
        document.getElementById("projects-grid");

    if (!projectsGrid) {
        return;
    }

    if (projects.length === 0) {

        projectsGrid.innerHTML = `
            <div class="projects-empty">
                No projects available.
            </div>
        `;

        return;
    }

    projectsGrid.innerHTML = projects.map(project => {

        return `
            <div
                class="project-card"
                data-project-id="${project.id}">

                <div class="project-card-header">

                    <div class="project-icon">
                        ${getInitial(project.name)}
                    </div>

                    <span class="project-status">
                        ${escapeHtml(
                            project.status
                                .charAt(0)
                                .toUpperCase() +
                            project.status.slice(1)
                        )}
                    </span>

                </div>

                <h3>
                    ${escapeHtml(project.name)}
                </h3>

                <p>
                    ${escapeHtml(
                        project.description || ""
                    )}
                </p>

                <div class="project-card-footer">

                    <small>
                        Project ID: ${project.id}
                    </small>

                    <button
                        type="button"
                        class="secondary-button project-view-button"
                        data-project-id="${project.id}">
                        View
                    </button>

                </div>

            </div>
        `;

    }).join("");


    document
        .querySelectorAll(".project-view-button")
        .forEach(button => {

            button.addEventListener(
                "click",
                event => {

                    event.stopPropagation();

                    const projectId =
                        Number(
                            button.dataset.projectId
                        );

                    openProjectDetails(
                        projectId,
                        projects
                    );

                }
            );

        });


    document
        .querySelectorAll(".project-card")
        .forEach(card => {

            card.addEventListener(
                "click",
                () => {

                    const projectId =
                        Number(
                            card.dataset.projectId
                        );

                    openProjectDetails(
                        projectId,
                        projects
                    );

                }
            );

        });

}

async function openProjectDetails(
    projectId,
    projects
) {

    currentProjectId = projectId;

    const project =
        projects.find(
            item => item.id === projectId
        );

    if (!project) {
        return;
    }


    const modal =
        document.getElementById(
            "project-details-modal"
        );

    if (!modal) {
        return;
    }


    document.getElementById(
        "project-details-name"
    ).textContent = project.name;


    document.getElementById(
        "project-details-description"
    ).textContent =
        project.description || "";


    document.getElementById(
        "project-details-status"
    ).textContent =
        formatStatus(
            project.status
        );


    document.getElementById(
        "project-details-id"
    ).textContent =
        project.id;


    document.getElementById(
        "project-details-owner"
    ).textContent =
        project.owner;

        // Load Project Team Members

const memberList =
    document.getElementById(
        "project-detail-members"
    );

if (memberList) {

    memberList.innerHTML = `
        <div class="projects-empty">
            Loading team members...
        </div>
    `;

    try {

        const memberResponse =
            await fetch(
                "/api/projects/members/"
            );

        if (!memberResponse.ok) {
            throw new Error(
                "Failed to load project members."
            );
        }

        const allMembers =
            await memberResponse.json();

        const projectMembers =
            allMembers.filter(
                member =>
                    member.project === projectId
            );

        if (
            projectMembers.length === 0
        ) {

            memberList.innerHTML = `
                <div class="projects-empty">
                    No team members assigned.
                </div>
            `;

        } else {

            memberList.innerHTML =
                projectMembers.map(
                    member => `
                        <div class="project-member-item">

                            <div class="project-member-avatar">
                                ${escapeHtml(
                                    member.username
                                        .charAt(0)
                                        .toUpperCase()
                                )}
                            </div>

                            <div class="project-member-info">

                                <strong>
                                    ${escapeHtml(
                                        member.username
                                    )}
                                </strong>

                                <span>
                                    ${escapeHtml(
                                        member.role
                                    )}
                                </span>

                            </div>

                        </div>
                    `
                ).join("");

        }

    } catch (error) {

        console.error(
            "Project members loading error:",
            error
        );

        memberList.innerHTML = `
            <div class="projects-empty">
                Unable to load team members.
            </div>
        `;

    }

}


    const taskList =
        document.getElementById(
            "project-task-list"
        );


    if (!taskList) {
        return;
    }


    taskList.innerHTML = `
        <div class="projects-empty">
            Loading tasks...
        </div>
    `;


    modal.classList.add("show");


    try {

        const response = await fetch(
            "/api/tasks/"
        );


        if (!response.ok) {
            throw new Error(
                "Failed to load project tasks."
            );
        }


        const tasks = await response.json();


        const projectTasks =
            tasks.filter(
                task =>
                    task.project === projectId
            );


        if (projectTasks.length === 0) {

            taskList.innerHTML = `
                <div class="projects-empty">
                    No tasks found for this project.
                </div>
            `;

            return;
        }


        taskList.innerHTML =
            projectTasks.map(task => {

                return `
                    <div class="project-task-item">

                        <div>

                            <h4>
                                ${escapeHtml(
                                    task.title
                                )}
                            </h4>

                            <p>
                                ${escapeHtml(
                                    task.description || ""
                                )}
                            </p>

                        </div>

                        <div class="project-task-meta">

                            <span class="project-task-status">
                                ${formatStatus(
                                    task.status
                                )}
                            </span>

                            <span class="kanban-priority priority-${task.priority}">
                                ${formatPriority(
                                    task.priority
                                )}
                            </span>

                        </div>

                    </div>
                `;

            }).join("");


    } catch (error) {

        console.error(
            "Project tasks loading error:",
            error
        );


        taskList.innerHTML = `
            <div class="projects-empty">
                Unable to load project tasks.
            </div>
        `;

    }

}

// Close Project Details Modal

const projectDetailsModal =
    document.getElementById(
        "project-details-modal"
    );

const closeProjectDetails =
    document.getElementById(
        "close-project-details"
    );

const cancelProjectDetails =
    document.getElementById(
        "cancel-project-details"
    );


function closeProjectDetailsModal() {

    if (projectDetailsModal) {

        projectDetailsModal.classList.remove(
            "show"
        );

    }

}


if (closeProjectDetails) {

    closeProjectDetails.addEventListener(
        "click",
        closeProjectDetailsModal
    );

}


if (cancelProjectDetails) {

    cancelProjectDetails.addEventListener(
        "click",
        closeProjectDetailsModal
    );

}


if (projectDetailsModal) {

    projectDetailsModal.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                projectDetailsModal
            ) {

                closeProjectDetailsModal();

            }

        }
    );

}

function updateStatistics(projects, tasks) {

    const totalProjects = projects.length;
    const totalTasks = tasks.length;

    const inProgressTasks = tasks.filter(
        task => task.status === "in_progress"
    ).length;

    const completedTasks = tasks.filter(
        task => task.status === "done"
    ).length;

    const statCards = document.querySelectorAll(".stat-card");

    if (statCards.length >= 4) {

        statCards[0].querySelector("strong").textContent =
            totalProjects;

        statCards[1].querySelector("strong").textContent =
            totalTasks;

        statCards[2].querySelector("strong").textContent =
            inProgressTasks;

        statCards[3].querySelector("strong").textContent =
            completedTasks;
    }
}


function renderRecentTasks(tasks) {

    const taskList = document.querySelector(".task-list");

    if (!taskList) {
        return;
    }

    if (tasks.length === 0) {
        taskList.innerHTML = `
            <div class="task-row">
                <p>No tasks available.</p>
            </div>
        `;

        return;
    }

    const recentTasks = tasks.slice(0, 5);

    taskList.innerHTML = recentTasks.map(task => {

        const statusLabel = formatStatus(task.status);

        const priorityLabel = formatPriority(task.priority);

        return `
            <div class="task-row">

                <div class="task-info">

                    <div class="task-status status-progress">
                        ${statusLabel}
                    </div>

                    <div>
                        <h3>
                            ${escapeHtml(task.title)}
                        </h3>

                        <p>
                            ${escapeHtml(task.project_name)}
                        </p>
                    </div>

                </div>

                <div class="task-meta">

                    <span class="priority-high">
                        ${priorityLabel}
                    </span>

                    <div class="avatar small">
                        ${getInitial(task.assigned_username)}
                    </div>

                </div>

            </div>
        `;

    }).join("");
}


function formatStatus(status) {

    const labels = {
        todo: "To Do",
        in_progress: "In Progress",
        review: "Review",
        done: "Done"
    };

    return labels[status] || status;
}


function formatPriority(priority) {

    const labels = {
        low: "Low",
        medium: "Medium",
        high: "High",
        urgent: "Urgent"
    };

    return labels[priority] || priority;
}


function getInitial(username) {

    if (!username) {
        return "?";
    }

    return username.charAt(0).toUpperCase();
}


function escapeHtml(value) {

    const div = document.createElement("div");

    div.textContent = value || "";

    return div.innerHTML;
}

async function loadProjectBoard(projectId) {

    try {

        const response = await fetch(
            `/api/tasks/board/?project=${projectId}`
        );

        if (!response.ok) {
            throw new Error("Failed to load project board.");
        }

        const data = await response.json();

        renderBoardColumn(
            "todo",
            data.board.todo
        );

        renderBoardColumn(
            "in_progress",
            data.board.in_progress
        );

        renderBoardColumn(
            "review",
            data.board.review
        );

        renderBoardColumn(
            "done",
            data.board.done
        );

    } catch (error) {

        console.error(
            "Board loading error:",
            error
        );

    }
}

function renderBoardColumn(status, tasks) {

    const columnMap = {
        todo: {
            container: "todo-column",
            count: "todo-count"
        },

        in_progress: {
            container: "progress-column",
            count: "progress-count"
        },

        review: {
            container: "review-column",
            count: "review-count"
        },

        done: {
            container: "done-column",
            count: "done-count"
        }
    };

    const config = columnMap[status];

    if (!config) {
        return;
    }

    const container = document.getElementById(
        config.container
    );

    const count = document.getElementById(
        config.count
    );

    if (!container || !count) {
        return;
    }

    count.textContent = tasks.length;

    if (tasks.length === 0) {

        container.innerHTML = `
            <div class="kanban-empty">
                No tasks
            </div>
        `;

        return;
    }

    container.innerHTML = tasks.map(task => {

        return `
            <div
    class="kanban-card"
    data-task-id="${task.id}">

                <h4>
                    ${escapeHtml(task.title)}
                </h4>

                <p class="kanban-card-description">
                    ${escapeHtml(task.description)}
                </p>

                <div class="kanban-card-footer">

                    <span class="kanban-priority priority-${task.priority}">
                        ${formatPriority(task.priority)}
                    </span>

                    <div class="avatar small">
                        ${getInitial(task.assigned_username)}
                    </div>

                </div>

            </div>
        `;

    }).join("");

    container
    .querySelectorAll(".kanban-card")
    .forEach((card, index) => {

        card.addEventListener("click", () => {

            openTaskDetails(tasks[index]);

        });

    });
}

// Task Details Modal

const taskDetailsModal = document.getElementById(
    "task-details-modal"
);

const closeTaskDetailsButton = document.getElementById(
    "close-task-details"
);

const cancelTaskDetailsButton = document.getElementById(
    "cancel-task-details"
);

let selectedTaskId = null;


async function openTaskDetails(task) {
    if (!taskDetailsModal) {
        console.error("Task details modal not found.");
        return;
    }

    selectedTaskId = task.id;

    document.getElementById(
        "details-task-title"
    ).textContent = task.title;

    document.getElementById(
        "details-project-name"
    ).textContent = task.project_name || "";

    document.getElementById(
        "details-title"
    ).value = task.title || "";

    document.getElementById(
        "details-description"
    ).value = task.description || "";

    document.getElementById(
        "details-status"
    ).value = task.status || "todo";

    document.getElementById(
    "details-priority"
).value = task.priority || "medium";

await populateTaskAssignees(
    task.project,
    "details-assignee",
    task.assigned_to
);

taskDetailsModal.classList.add("show");

loadTaskComments(task.id);
}

async function loadTaskComments(taskId) {

    const commentsList = document.getElementById(
        "comments-list"
    );

    const commentCount = document.getElementById(
        "comment-count"
    );

    if (!commentsList) {
        return;
    }

    try {

        const response = await fetch(
            "/api/comments/"
        );

        if (!response.ok) {
            throw new Error(
                "Failed to load comments."
            );
        }

        const comments = await response.json();

        const taskComments = comments.filter(
            comment => comment.task === taskId
        );

        if (commentCount) {
            commentCount.textContent =
                taskComments.length;
        }

        if (taskComments.length === 0) {

            commentsList.innerHTML = `
                <div class="comments-empty">
                    No comments yet.
                </div>
            `;

            return;
        }

        commentsList.innerHTML =
            taskComments.map(comment => {

                return `
                    <div class="comment-item">

                        <div class="comment-header">

                            <div class="comment-author">

                                <div class="avatar small">
                                    ${getInitial(
                                        comment.author_username
                                    )}
                                </div>

                                <strong>
                                    ${escapeHtml(
                                        comment.author_username
                                    )}
                                </strong>

                            </div>

                            <small>
                                ${formatCommentDate(
                                    comment.created_at
                                )}
                            </small>

                        </div>

                        <p>
                            ${escapeHtml(
                                comment.content
                            )}
                        </p>

                    </div>
                `;

            }).join("");

    } catch (error) {

        console.error(
            "Comment loading error:",
            error
        );

        commentsList.innerHTML = `
            <div class="comments-empty">
                Unable to load comments.
            </div>
        `;
    }
}

function formatCommentDate(dateString) {

    if (!dateString) {
        return "";
    }

    const date = new Date(dateString);

    return date.toLocaleString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}

function closeTaskDetails() {

    if (!taskDetailsModal) {
        return;
    }

    selectedTaskId = null;

    taskDetailsModal.classList.remove("show");
}


if (closeTaskDetailsButton) {

    closeTaskDetailsButton.addEventListener(
        "click",
        closeTaskDetails
    );

}


if (cancelTaskDetailsButton) {

    cancelTaskDetailsButton.addEventListener(
        "click",
        closeTaskDetails
    );

}


if (taskDetailsModal) {

    taskDetailsModal.addEventListener(
        "click",
        event => {

            if (event.target === taskDetailsModal) {
                closeTaskDetails();
            }

        }
    );

}
 

// Add Comment

const addCommentButton = document.getElementById(
    "add-comment"
);

if (addCommentButton) {

    addCommentButton.addEventListener(
        "click",
        async () => {

            if (!selectedTaskId) {
                alert("No task selected.");
                return;
            }

            const commentInput =
                document.getElementById("new-comment");

            const content =
                commentInput.value.trim();

            if (!content) {
                alert("Please enter a comment.");
                return;
            }

            try {

                const csrftoken = getCookie(
                    "csrftoken"
                );

                const response = await fetch(
                    "/api/comments/",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",

                            "X-CSRFToken":
                                csrftoken
                        },

                        body: JSON.stringify({
                            task: selectedTaskId,
                            content: content
                        })
                    }
                );

                if (!response.ok) {

                    const errorData =
                        await response.json();

                    console.error(
                        "Comment creation error:",
                        errorData
                    );

                    throw new Error(
                        "Failed to create comment."
                    );
                }

                const newComment =
                    await response.json();

                console.log(
                    "Comment created:",
                    newComment
                );

                commentInput.value = "";

                await loadTaskComments(
                    selectedTaskId
                );

                alert(
                    "Comment added successfully!"
                );

            } catch (error) {

                console.error(
                    "Comment creation failed:",
                    error
                );

                alert(
                    "Unable to add the comment. Please try again."
                );
            }
        }
    );

}
// Update Task

const taskDetailsForm = document.getElementById(
    "task-details-form"
);


if (taskDetailsForm) {

    taskDetailsForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();

            if (!selectedTaskId) {
                alert("No task selected.");
                return;
            }

            const title = document.getElementById(
                "details-title"
            ).value.trim();

            const description = document.getElementById(
                "details-description"
            ).value.trim();

            const status = document.getElementById(
                "details-status"
            ).value;

            const priority = document.getElementById(
                "details-priority"
            ).value;

            const assignedTo = document.getElementById(
                "details-assignee"
            ).value;


            if (!title) {
                alert("Task title is required.");
                return;
            }


            const taskData = {
                title: title,
                description: description,
                status: status,
                priority: priority,
                assigned_to: assignedTo
                    ? Number(assignedTo)
                    : null
            };


            try {

                const csrftoken = getCookie(
                    "csrftoken"
                );


                const response = await fetch(
                    `/api/tasks/${selectedTaskId}/`,
                    {
                        method: "PATCH",

                        headers: {
                            "Content-Type":
                                "application/json",

                            "X-CSRFToken":
                                csrftoken
                        },

                        body: JSON.stringify(taskData)
                    }
                );


                if (!response.ok) {

                    const errorData =
                        await response.json();

                    console.error(
                        "Task update error:",
                        errorData
                    );

                    throw new Error(
                        "Failed to update task."
                    );
                }


                const updatedTask =
                    await response.json();


                console.log(
                    "Task updated:",
                    updatedTask
                );


                closeTaskDetails();

                await loadDashboard();

const currentBoardProject =
    document.getElementById(
        "board-project-select"
    );

if (currentBoardProject) {

    const projectId =
        Number(
            currentBoardProject.value
        );

    if (projectId) {
        await loadProjectBoard(projectId);
    }

}

alert("Task updated successfully!");

            } catch (error) {

                console.error(
                    "Task update failed:",
                    error
                );

                alert(
                    "Unable to update the task. Please try again."
                );

            }

        }
    );

}

// Delete Task

const deleteTaskButton = document.getElementById(
    "delete-task"
);


if (deleteTaskButton) {

    deleteTaskButton.addEventListener(
        "click",
        async () => {

            if (!selectedTaskId) {
                alert("No task selected.");
                return;
            }


            const confirmed = confirm(
                "Are you sure you want to delete this task?"
            );


            if (!confirmed) {
                return;
            }


            try {

                const csrftoken = getCookie(
                    "csrftoken"
                );


                const response = await fetch(
                    `/api/tasks/${selectedTaskId}/`,
                    {
                        method: "DELETE",

                        headers: {
                            "X-CSRFToken":
                                csrftoken
                        }
                    }
                );


                if (!response.ok) {

                    const errorData =
                        await response.text();

                    console.error(
                        "Task deletion error:",
                        errorData
                    );

                    throw new Error(
                        "Failed to delete task."
                    );
                }


                closeTaskDetails();

                await loadDashboard();

const currentBoardProject =
    document.getElementById(
        "board-project-select"
    );

if (currentBoardProject) {

    const projectId =
        Number(
            currentBoardProject.value
        );

    if (projectId) {
        await loadProjectBoard(projectId);
    }

}

alert(
    "Task deleted successfully!"
);


            } catch (error) {

                console.error(
                    "Task deletion failed:",
                    error
                );

                alert(
                    "Unable to delete the task. Please try again."
                );

            }

        }
    );

}

// New Project Modal

const projectModal = document.getElementById(
    "project-modal"
);

const newProjectButton = document.getElementById(
    "new-project-button"
);

const closeProjectModal = document.getElementById(
    "close-project-modal"
);

const cancelProject = document.getElementById(
    "cancel-project"
);


function openProjectModal() {

    if (projectModal) {
        projectModal.classList.add("show");
    }

}


function closeProjectModalWindow() {

    if (projectModal) {
        projectModal.classList.remove("show");
    }

}


if (newProjectButton) {

    newProjectButton.addEventListener(
        "click",
        openProjectModal
    );

}


if (closeProjectModal) {

    closeProjectModal.addEventListener(
        "click",
        closeProjectModalWindow
    );

}


if (cancelProject) {

    cancelProject.addEventListener(
        "click",
        closeProjectModalWindow
    );

}


if (projectModal) {

    projectModal.addEventListener(
        "click",
        event => {

            if (event.target === projectModal) {
                closeProjectModalWindow();
            }

        }
    );

}

// ==========================================
// Create / Edit Project
// ==========================================

const projectForm =
    document.getElementById(
        "project-form"
    );

if (projectForm) {

    projectForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const name =
                document.getElementById(
                    "project-name"
                ).value.trim();

            const description =
                document.getElementById(
                    "project-description"
                ).value.trim();

            const status =
                document.getElementById(
                    "project-status"
                ).value;


            if (!name) {

                alert(
                    "Please enter a project name."
                );

                return;
            }


            if (!description) {

                alert(
                    "Please enter a project description."
                );

                return;
            }


            const isEditing =
                projectForm.dataset.editing ===
                "true";

            const editingProjectId =
                projectForm.dataset.projectId;


            const projectData = {
                name: name,
                description: description,
                status: status
            };


            try {

                const csrftoken =
                    getCookie(
                        "csrftoken"
                    );


                // ==================================
                // EDIT EXISTING PROJECT
                // ==================================

                if (
    isEditing &&
    editingProjectId
) {

    const response = await fetch(
        `/api/projects/${editingProjectId}/`,
        {
            method: "PATCH",

            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": csrftoken
            },

            body: JSON.stringify(projectData)
        }
    );


    if (!response.ok) {

        const errorData =
            await response.json();

        console.error(
            "Project update error:",
            errorData
        );

        throw new Error(
            "Failed to update project."
        );
    }


    const updatedProject =
        await response.json();


    console.log(
        "Project updated:",
        updatedProject
    );


    // ==================================
    // UPDATE PROJECT TEAM MEMBERS
    // ==================================

    const memberSelects =
        document.querySelectorAll(
            ".project-member-select"
        );


    // Get selected member IDs
    const selectedMemberIds =
        Array.from(memberSelects)
            .map(select => Number(select.value))
            .filter(id => id);


    // Get existing project members
    const membersResponse =
        await fetch(
            "/api/projects/members/"
        );


    if (!membersResponse.ok) {

        throw new Error(
            "Unable to load project members."
        );
    }


    const allMembers =
        await membersResponse.json();


    const existingMembers =
        allMembers.filter(
            member =>
                member.project ===
                Number(editingProjectId)
        );


    // Delete old members
    for (
        const member of existingMembers
    ) {

        const deleteResponse =
            await fetch(
                `/api/projects/members/${member.id}/`,
                {
                    method: "DELETE",

                    headers: {
                        "X-CSRFToken":
                            csrftoken
                    }
                }
            );


        if (!deleteResponse.ok) {

            console.error(
                "Failed to remove member:",
                member.username
            );

        }

    }


    // Add newly selected members
    for (
        const userId of selectedMemberIds
    ) {

        const memberResponse =
            await fetch(
                "/api/projects/members/",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        "X-CSRFToken":
                            csrftoken
                    },

                    body: JSON.stringify({
                        project:
                            Number(editingProjectId),

                        user:
                            userId,

                        role:
                            "member"
                    })
                }
            );


        if (!memberResponse.ok) {

            const errorData =
                await memberResponse.json();

            console.error(
                "Failed to add member:",
                errorData
            );

            throw new Error(
                "Project updated, but a team member could not be added."
            );
        }

    }


    // Reset edit mode
    delete projectForm.dataset.editing;
    delete projectForm.dataset.projectId;


    // Restore modal title
    const title =
        document.querySelector(
            "#project-modal .modal-header h2"
        );

    if (title) {

        title.textContent =
            "Create New Project";
    }


    const modalDescription =
        document.querySelector(
            "#project-modal .modal-header p"
        );

    if (modalDescription) {

        modalDescription.textContent =
            "Create a workspace for your team.";
    }


    const submitButton =
        document.querySelector(
            "#project-form button[type='submit']"
        );

    if (submitButton) {

        submitButton.textContent =
            "Create Project";
    }


    projectForm.reset();

    closeProjectModalWindow();

    await loadDashboard();


    alert(
        "Project and team members updated successfully!"
    );

    return;
}

                // ==================================
                // CREATE NEW PROJECT
                // ==================================

                let memberIds = [];


                const teamType =
                    document.getElementById(
                        "project-team-type"
                    ).value;

                const teamSize =
                    Number(
                        document.getElementById(
                            "project-team-size"
                        ).value
                    );


                if (
                    teamType === "team"
                ) {

                    const memberSelects =
                        document.querySelectorAll(
                            ".project-member-select"
                        );


                    if (
                        !teamSize ||
                        teamSize < 1
                    ) {

                        alert(
                            "Please enter the number of team members."
                        );

                        return;
                    }


                    if (
                        memberSelects.length !==
                        teamSize
                    ) {

                        alert(
                            "Please select the team members."
                        );

                        return;
                    }


                    memberIds =
                        Array.from(
                            memberSelects
                        ).map(
                            select =>
                                Number(
                                    select.value
                                )
                        );


                    if (
                        memberIds.some(
                            id => !id
                        )
                    ) {

                        alert(
                            "Please select every team member."
                        );

                        return;
                    }


                    if (
                        new Set(memberIds).size !==
                        memberIds.length
                    ) {

                        alert(
                            "Please select different users for each team member."
                        );

                        return;
                    }

                }


                const response =
                    await fetch(
                        "/api/projects/",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json",

                                "X-CSRFToken":
                                    csrftoken
                            },

                            body:
                                JSON.stringify(
                                    projectData
                                )
                        }
                    );


                if (!response.ok) {

                    const errorData =
                        await response.json();

                    console.error(
                        "Project creation error:",
                        errorData
                    );

                    throw new Error(
                        "Failed to create project."
                    );

                }


                const newProject =
                    await response.json();


                console.log(
                    "Project created:",
                    newProject
                );


                // Add team members

                if (
                    teamType === "team" &&
                    memberIds.length > 0
                ) {

                    for (
                        const userId
                        of memberIds
                    ) {

                        const memberResponse =
                            await fetch(
                                "/api/projects/members/",
                                {
                                    method: "POST",

                                    headers: {
                                        "Content-Type":
                                            "application/json",

                                        "X-CSRFToken":
                                            csrftoken
                                    },

                                    body:
                                        JSON.stringify({
                                            project:
                                                newProject.id,

                                            user:
                                                userId,

                                            role:
                                                "member"
                                        })
                                }
                            );


                        if (
                            !memberResponse.ok
                        ) {

                            console.error(
                                "Failed to add team member:",
                                userId
                            );

                            throw new Error(
                                "Project created, but a team member could not be added."
                            );

                        }

                    }

                }


                projectForm.reset();

                closeProjectModalWindow();

                await loadDashboard();


                alert(
                    "Project created successfully!"
                );


            } catch (error) {

                console.error(
                    "Project operation failed:",
                    error
                );

                alert(
                    error.message ||
                    "Unable to save the project."
                );

            }

        }
    );

}

// New Task Modal

const taskModal = document.getElementById("task-modal");
const closeTaskModal = document.getElementById("close-task-modal");
const cancelTask = document.getElementById("cancel-task");

const newTaskButtons = document.querySelectorAll(
    ".primary-button"
);


function openTaskModal() {
    if (taskModal) {
        taskModal.classList.add("show");
    }
}


function closeTaskModalWindow() {
    if (taskModal) {
        taskModal.classList.remove("show");
    }
}


newTaskButtons.forEach(button => {

    if (
        button.textContent.includes("New Task") ||
        button.id === "board-new-task"
    ) {
        button.addEventListener(
            "click",
            openTaskModal
        );
    }

});


if (closeTaskModal) {

    closeTaskModal.addEventListener(
        "click",
        closeTaskModalWindow
    );

}


if (cancelTask) {

    cancelTask.addEventListener(
        "click",
        closeTaskModalWindow
    );

}


if (taskModal) {

    taskModal.addEventListener(
        "click",
        event => {

            if (event.target === taskModal) {
                closeTaskModalWindow();
            }

        }
    );

}

// Create Task

const taskForm = document.getElementById("task-form");


if (taskForm) {

    taskForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        const project = document.getElementById(
            "task-project"
        ).value;

        const title = document.getElementById(
            "task-title"
        ).value.trim();

        const description = document.getElementById(
            "task-description"
        ).value.trim();

        const assignedTo = document.getElementById(
            "task-assignee"
        ).value;

        const priority = document.getElementById(
            "task-priority"
        ).value;

        const status = document.getElementById(
            "task-status"
        ).value;

        const dueDate = document.getElementById(
            "task-due-date"
        ).value;


        if (!title) {
            alert("Please enter a task title.");
            return;
        }


        const taskData = {
            project: Number(project),
            title: title,
            description: description,
            assigned_to: assignedTo
                ? Number(assignedTo)
                : null,
            status: status,
            priority: priority,
            due_date: dueDate
                ? new Date(dueDate).toISOString()
                : null
        };


        try {

            const csrftoken = getCookie("csrftoken");

const response = await fetch(
    "/api/tasks/",
    {
        method: "POST",

        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrftoken
        },

        body: JSON.stringify(taskData)
    }
);


            if (!response.ok) {

                const errorData =
                    await response.json();

                console.error(
                    "Task creation error:",
                    errorData
                );

                throw new Error(
                    "Failed to create task."
                );
            }


            const newTask =
                await response.json();

            console.log(
                "Task created:",
                newTask
            );


            taskForm.reset();


            closeTaskModalWindow();


            await loadDashboard();

            alert("Task created successfully!");


        } catch (error) {

            console.error(
                "Task creation failed:",
                error
            );

            alert(
                "Unable to create the task. Please try again."
            );
        }

    });

}

function getCookie(name) {
    const cookies = document.cookie.split(";");

    for (const cookie of cookies) {
        const trimmedCookie = cookie.trim();

        if (trimmedCookie.startsWith(name + "=")) {
            return decodeURIComponent(
                trimmedCookie.substring(name.length + 1)
            );
        }
    }

    return null;
}

// Notifications

const notificationButton =
    document.getElementById(
        "notification-button"
    );

const notificationPanel =
    document.getElementById(
        "notification-panel"
    );

const closeNotifications =
    document.getElementById(
        "close-notifications"
    );


if (notificationButton) {

    notificationButton.addEventListener(
        "click",
        event => {

            event.stopPropagation();

            if (notificationPanel) {

                notificationPanel.classList.toggle(
                    "show"
                );

            }

        }
    );

}


if (closeNotifications) {

    closeNotifications.addEventListener(
        "click",
        () => {

            if (notificationPanel) {

                notificationPanel.classList.remove(
                    "show"
                );

            }

        }
    );

}


document.addEventListener(
    "click",
    event => {

        if (
            notificationPanel &&
            notificationButton &&
            !notificationPanel.contains(event.target) &&
            !notificationButton.contains(event.target)
        ) {

            notificationPanel.classList.remove(
                "show"
            );

        }

    }
);

// User Profile Menu

const userProfileButton =
    document.getElementById(
        "user-profile-button"
    );

const userProfileMenu =
    document.getElementById(
        "user-profile-menu"
    );

if (userProfileButton) {

    userProfileButton.addEventListener(
        "click",
        event => {

            event.stopPropagation();

            if (userProfileMenu) {

                userProfileMenu.classList.toggle(
                    "show"
                );

            }

        }
    );

}


document.addEventListener(
    "click",
    event => {

        if (
            userProfileMenu &&
            userProfileButton &&
            !userProfileMenu.contains(event.target) &&
            !userProfileButton.contains(event.target)
        ) {

            userProfileMenu.classList.remove(
                "show"
            );

        }

    }
);

// Profile Menu Actions

const profileMenuProfile =
    document.getElementById(
        "profile-menu-profile"
    );

const profileMenuSettings =
    document.getElementById(
        "profile-menu-settings"
    );

const profileMenuLogout =
    document.getElementById(
        "profile-menu-logout"
    );

if (profileMenuProfile) {

    profileMenuProfile.addEventListener(
        "click",
        () => {

            alert(
                "My Profile feature is coming soon."
            );

        }
    );

}


if (profileMenuSettings) {

    profileMenuSettings.addEventListener(
        "click",
        () => {

            alert(
                "Settings feature is coming soon."
            );

        }
    );

}

if (profileMenuLogout) {

    profileMenuLogout.addEventListener(
        "click",
        () => {

            window.location.href =
                "/accounts/logout/";

        }
    );

}

// Frontend Navigation

const navItems = document.querySelectorAll(".nav-item");

navItems.forEach(item => {

    item.addEventListener("click", event => {

        const text = item.textContent.trim();

        // Keep Admin link working normally
        if (item.getAttribute("href") === "/admin/") {
            return;
        }

        event.preventDefault();

        navItems.forEach(nav => {
            nav.classList.remove("active");
        });

        item.classList.add("active");

        if (text.includes("Dashboard")) {
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        }

       if (text.includes("Projects")) {
    scrollToSection("#projects-section");
}

        if (text.includes("My Tasks")) {
            scrollToSection(".task-list");
        }

        if (text.includes("Board")) {
            scrollToSection(".board-section");
        }

        if (text.includes("Team")) {
            scrollToSection(".task-list");
        }

    });

});


function scrollToSection(selector) {

    const section = document.querySelector(selector);

    if (section) {

        section.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }

}

// Load Current Logged-In User

async function loadCurrentUser() {

    try {

        const response =
            await fetch(
                "/accounts/current-user/"
            );

        if (!response.ok) {
            throw new Error(
                "Unable to load current user."
            );
        }

        const user =
            await response.json();


        const userName =
            document.getElementById(
                "user-name"
            );

            const welcomeUserName =
    document.getElementById(
        "welcome-user-name"
    );

        const userAvatar =
            document.getElementById(
                "user-avatar"
            );

        const menuUserName =
            document.getElementById(
                "menu-user-name"
            );


        if (userName) {

            userName.textContent =
                user.username;

        }

        if (welcomeUserName) {

    welcomeUserName.textContent =
        user.username;

}


        if (userAvatar) {

            userAvatar.textContent =
                user.username
                    .charAt(0)
                    .toUpperCase();

        }


        if (menuUserName) {

            menuUserName.textContent =
                user.username;

        }

    } catch (error) {

        console.error(
            "Current user loading error:",
            error
        );

    }

}

// ==========================================
// Project Team Selection
// ==========================================

async function setupProjectTeamSelector() {

    const teamType =
        document.getElementById(
            "project-team-type"
        );

    const teamSizeGroup =
        document.getElementById(
            "project-team-size-group"
        );

    const teamSize =
        document.getElementById(
            "project-team-size"
        );

    const membersGroup =
        document.getElementById(
            "project-members-group"
        );

    const membersList =
        document.getElementById(
            "project-members-list"
        );


    if (
        !teamType ||
        !teamSizeGroup ||
        !teamSize ||
        !membersGroup ||
        !membersList
    ) {
        return;
    }


    let users = [];


    // Load available users
    try {

        const response =
            await fetch("/accounts/users/");

        if (!response.ok) {
            throw new Error(
                "Unable to load users."
            );
        }

        users =
            await response.json();

    } catch (error) {

        console.error(
            "User loading error:",
            error
        );

        users = [];

    }


    function renderMemberFields() {

        membersList.innerHTML = "";

        const count =
            Number(teamSize.value);


        if (!count || count < 1) {
            return;
        }


        for (
            let i = 1;
            i <= count;
            i++
        ) {

            const wrapper =
                document.createElement(
                    "div"
                );

            wrapper.className =
                "form-group";


            const label =
                document.createElement(
                    "label"
                );

            label.textContent =
                `Team Member ${i}`;


            const select =
                document.createElement(
                    "select"
                );

            select.className =
                "project-member-select";

            select.required = true;


            const emptyOption =
                document.createElement(
                    "option"
                );

            emptyOption.value = "";

            emptyOption.textContent =
                "Select member";

            select.appendChild(
                emptyOption
            );


            users.forEach(user => {

                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    user.id;

                option.textContent =
                    user.username;

                select.appendChild(
                    option
                );

            });


            wrapper.appendChild(label);

            wrapper.appendChild(select);

            membersList.appendChild(
                wrapper
            );

        }

    }


    function updateTeamFields() {

        if (
            teamType.value ===
            "team"
        ) {

            teamSizeGroup.style.display =
                "block";

            membersGroup.style.display =
                "block";

            renderMemberFields();

        } else {

            teamSizeGroup.style.display =
                "none";

            membersGroup.style.display =
                "none";

            membersList.innerHTML = "";

        }

    }


    teamType.addEventListener(
        "change",
        updateTeamFields
    );


    teamSize.addEventListener(
        "input",
        renderMemberFields
    );


    updateTeamFields();

}

document.addEventListener(
    "DOMContentLoaded",
    () => {
        setupProjectTeamSelector();
    }
);

// ==========================================
// Project Edit & Delete
// ==========================================

let currentProjectId = null;


// ------------------------------------------
// Edit Project
// ------------------------------------------

const editProjectButton =
    document.getElementById(
        "edit-project-details"
    );

if (editProjectButton) {

    editProjectButton.addEventListener(
        "click",
        async () => {

            if (!currentProjectId) {

                alert(
                    "No project selected."
                );

                return;
            }


            try {

                const response =
                    await fetch(
                        "/api/projects/"
                    );


                if (!response.ok) {

                    throw new Error(
                        "Unable to load project."
                    );

                }


                const projects =
                    await response.json();


                const project =
                    projects.find(
                        item =>
                            item.id ===
                            currentProjectId
                    );


                if (!project) {

                    alert(
                        "Project not found."
                    );

                    return;
                }


                // Close details modal

                const detailsModal =
                    document.getElementById(
                        "project-details-modal"
                    );

                if (detailsModal) {

                    detailsModal.classList.remove(
                        "show"
                    );

                }


                // Fill existing project form

                document.getElementById(
                    "project-name"
                ).value =
                    project.name;


                document.getElementById(
                    "project-description"
                ).value =
                    project.description || "";


                document.getElementById(
                    "project-status"
                ).value =
                    project.status;

                    const existingMembers =
    await loadProjectMembers(
        currentProjectId
    );

const teamType =
    document.getElementById(
        "project-team-type"
    );

const teamSize =
    document.getElementById(
        "project-team-size"
    );

const teamSizeGroup =
    document.getElementById(
        "project-team-size-group"
    );

const membersGroup =
    document.getElementById(
        "project-members-group"
    );

const membersList =
    document.getElementById(
        "project-members-list"
    );

if (existingMembers.length > 0) {

    teamType.value = "team";

    teamSize.value =
        existingMembers.length;

    teamSizeGroup.style.display =
        "block";

    membersGroup.style.display =
        "block";

    membersList.innerHTML = "";

    const usersResponse =
        await fetch("/accounts/users/");

    if (!usersResponse.ok) {
        throw new Error(
            "Unable to load users."
        );
    }

    const users =
        await usersResponse.json();

    existingMembers.forEach(
        (member, index) => {

            const wrapper =
                document.createElement(
                    "div"
                );

            wrapper.className =
                "form-group";

            const label =
                document.createElement(
                    "label"
                );

            label.textContent =
                `Team Member ${index + 1}`;

            const select =
                document.createElement(
                    "select"
                );

            select.className =
                "project-member-select";

            select.required = true;

            const emptyOption =
                document.createElement(
                    "option"
                );

            emptyOption.value = "";
            emptyOption.textContent =
                "Select member";

            select.appendChild(
                emptyOption
            );

            users.forEach(user => {

                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    user.id;

                option.textContent =
                    user.username;

                if (
                    Number(user.id) ===
                    Number(member.user)
                ) {
                    option.selected = true;
                }

                select.appendChild(
                    option
                );
            });

            wrapper.appendChild(label);
            wrapper.appendChild(select);
            membersList.appendChild(wrapper);
        }
    );

} else {

    teamType.value = "individual";

    teamSize.value = 1;

    teamSizeGroup.style.display =
        "none";

    membersGroup.style.display =
        "none";

    membersList.innerHTML = "";
}


                // Open project form

                const projectModal =
                    document.getElementById(
                        "project-modal"
                    );

                if (projectModal) {

                    projectModal.classList.add(
                        "show"
                    );

                }


                // Change heading

                const projectModalTitle =
                    document.querySelector(
                        "#project-modal .modal-header h2"
                    );

                if (projectModalTitle) {

                    projectModalTitle.textContent =
                        "Edit Project";

                }


                const projectModalDescription =
                    document.querySelector(
                        "#project-modal .modal-header p"
                    );

                if (projectModalDescription) {

                    projectModalDescription.textContent =
                        "Update your project details.";

                }


                // Change submit button

                const submitButton =
                    document.querySelector(
                        "#project-form button[type='submit']"
                    );

                if (submitButton) {

                    submitButton.textContent =
                        "Save Changes";

                }


                // Store edit mode

                projectForm.dataset.editing =
                    "true";

                projectForm.dataset.projectId =
                    currentProjectId;

            } catch (error) {

                console.error(
                    "Project edit error:",
                    error
                );

                alert(
                    "Unable to open project for editing."
                );

            }

        }
    );

}


// ------------------------------------------
// Delete Project
// ------------------------------------------

const deleteProjectButton =
    document.getElementById(
        "delete-project-details"
    );

if (deleteProjectButton) {

    deleteProjectButton.addEventListener(
        "click",
        async () => {

            if (!currentProjectId) {

                alert(
                    "No project selected."
                );

                return;
            }


            const confirmed =
                confirm(
                    "Are you sure you want to delete this project? This action cannot be undone."
                );


            if (!confirmed) {
                return;
            }


            try {

                const csrftoken =
                    getCookie(
                        "csrftoken"
                    );


                const response =
                    await fetch(
                        `/api/projects/${currentProjectId}/`,
                        {
                            method: "DELETE",

                            headers: {
                                "X-CSRFToken":
                                    csrftoken
                            }
                        }
                    );


                if (
                    !response.ok &&
                    response.status !== 204
                ) {

                    throw new Error(
                        "Failed to delete project."
                    );

                }


                const detailsModal =
                    document.getElementById(
                        "project-details-modal"
                    );


                if (detailsModal) {

                    detailsModal.classList.remove(
                        "show"
                    );

                }


                currentProjectId = null;


                await loadDashboard();


                alert(
                    "Project deleted successfully."
                );


            } catch (error) {

                console.error(
                    "Project deletion error:",
                    error
                );

                alert(
                    "Unable to delete the project."
                );

            }

        }
    );

}