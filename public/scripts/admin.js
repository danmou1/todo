
const newTaskButton = document.getElementById('new-task-button');
const taskFormContainer = document.getElementById('task-form-container');
const tasksContainer = document.getElementById('tasks-container');
const searchForm = document.getElementById('search-form');
const taskForm = document.getElementById('task-form');

document.addEventListener('DOMContentLoaded', function() {
    searchForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const searchInput = document.getElementById('search-input').value.trim();
        const dateRegex = /date:(\d{2}-\d{2}-\d{4})/;
        const date = searchInput.match(dateRegex) ? searchInput.match(dateRegex)[1] : null;
        const completedRegex = /completed:(true|false)/i;
        const completed = searchInput.match(completedRegex) ? searchInput.match(completedRegex)[1] : null;
        const searchQuery = searchInput.replace(dateRegex, '').replace(completedRegex, '').trim();

        let queryString = '';

        if (searchQuery) {
            queryString += `?q=${encodeURIComponent(searchQuery)}`;
        }

        if (date) {
            queryString += `${searchQuery ? '&' : '?'}d=${encodeURIComponent(date)}`;
        }

        if (completed !== null ) {
            queryString += `${searchQuery || date ? '&' : '?'}c=${completed}`;
        }

        const pathname = window.location.pathname;;
        const directories = pathname.split('/');
        const lastDir = directories.pop();

        window.location.href = lastDir + queryString;
    });

    newTaskButton.addEventListener('click', function () {
        taskFormContainer.style.display = 'block';
        tasksContainer.style.display = 'none';
    });

    const checkboxes = document.querySelectorAll('input[type="checkbox"][id="task-checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', async function () {
            const taskId = this.getAttribute('data-taskId');
            const isCompleted = this.checked;
        
            try {
                await fetch(`/api/v1/tasks`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ taskId, completed: isCompleted })
                });
            } catch (error) {
                console.error('Error marking task as completed:', error);
            }
        });
    });
});

async function deleteTask(taskId, title) {
    const confirmed = confirm(`Are you sure you want to delete "${title}"?`);
    
    if (!confirmed) {
        return;
    }

    try {
        const response = await fetch(`/api/v1/tasks`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ taskId })
        });

        if (response.ok) {
            const deletedRow = document.getElementById(`task-row-${taskId}`);
            if (deletedRow) {
                deletedRow.remove();
            } else {
                console.error("Error: Deleted row not found in the table.");
            }
        } else {
            const errorMessage = await response.text();
            console.error(`Error deleting task: ${errorMessage}`);
        }
    } catch (error) {
        console.error("Error:", error);
    }
};

let isEditTask = false;
let formTaskId = '';

function editTask(taskId) {
    const taskRow = document.getElementById(`task-row-${taskId}`);
    const titleInput = taskForm.elements['title'];
    const descriptionInput = taskForm.elements['description'];
    const dueDateInput = taskForm.elements['dueDate'];
    const priorityInput = taskForm.elements['priority'];
    const ownerIdInput = taskForm.elements['taskUserId'];
    
    titleInput.value = taskRow.cells[1].textContent;
    descriptionInput.value = taskRow.cells[2].textContent;
    dueDateInput.value = taskRow.cells[3].textContent;
    priorityInput.value = taskRow.cells[4].textContent;
    ownerIdInput.value = taskRow.cells[5].textContent;

    taskFormContainer.style.display = 'block';
    tasksContainer.style.display = 'none';

    isEdit = true;
    formTaskId = taskId;
};

function submitTaskForm(taskId) {
    const formData =  {
        title: document.getElementById('title').value,
        description: document.getElementById('description').value,
        dueDate: document.getElementById('dueDate').value,
        priority: document.getElementById('priority').value,
        userId: document.getElementById('taskUserId').value,
    };
    if (taskId) {
        formData.taskId = (taskId);
    }

    const method = isEdit ? 'PUT' : 'POST';
    fetch('/ap1/v1/tasks', {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
    .then(res => {
        if (res.ok) {
            window.location.reload();
        }
    })
    .catch(err => {
        console.error('Error submitting task:', err);
    })
}

const newUserButton = document.getElementById('new-user-button');
const usersContainer = document.getElementById('users-container');
const userFormContainer = document.getElementById('user-form-container');
const userForm = document.getElementById('user-form');

newUserButton.addEventListener('click', function() {
    userFormContainer.style.display = 'block';
    usersContainer.style.display = 'none';
});

let isEditUser = false;
let formUserId = '';

function editUser(taskId) {
    const userRow = document.getElementById(`task-row-${taskId}`);
    const userIdInput = userForm.elements['userId'];
    const usernameInput = userForm.elements['username'];
    const roleInput = userForm.elements['role'];
    
    userIdInput.value = userRow.cells[0].textContent;
    usernameInput.value = userRow.cells[1].textContent;
    roleInput.value = userRow.cells[2].textContent;

    userFormContainer.style.display = 'block';
    usersContainer.style.display = 'none';

    isEditUser = true;
    formUserId = userId;
};

function submitUserForm(userId) {
    const formData =  {
        user_id: document.getElementById('userId').value,
        username: document.getElementById('username').value,
        role: document.getElementById('role').value,
    };
    
    const method = isEditUser ? 'PUT' : 'POST';
    fetch('/ap1/v1/users', {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
    .then(res => {
        if (res.ok) {
            window.location.reload();
        }
    })
    .catch(err => {
        console.error('Error submitting task:', err);
    })
}

async function deleteUser(userId) {
    const confirmed = confirm(`Are you sure you want to delete user with ID: "${userId}"?`);
    
    if (!confirmed) {
        return;
    }

    try {
        const response = await fetch(`/api/v1/users/`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId })
        });

        if (response.ok) {
            const deletedRow = document.getElementById(`user-row-${userId}`);
            if (deletedRow) {
                deletedRow.remove();
            } else {
                console.error("Error: Deleted row not found in the table.");
            }
        } else {
            const errorMessage = await response.text();
            console.error(`Error deleting user: ${errorMessage}`);
        }
    } catch (error) {
        console.error("Error:", error);
    }
};