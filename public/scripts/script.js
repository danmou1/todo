const newTaskButton = document.getElementById('new-task-button');
const taskFormContainer = document.getElementById('task-form-container');
const tasksContainer = document.getElementById('tasks-container');
const searchForm = document.getElementById('search-form');
const taskForm = document.getElementById('task-form');

document.addEventListener('DOMContentLoaded', function() {
    searchForm.addEventListener('submit', function(event) {
        event.preventDefault();

        console.log('submit event started');

        const searchInput = document.getElementById('search-input').value.trim();
        const dateRegex = /date:(\d{2}-\d{2}-\d{4})/;
        const date = searchInput.match(dateRegex) ? searchInput.match(dateRegex)[1] : null;
        const completedRegex = /completed:(true|false)/i;
        const completed = searchInput.match(completedRegex) ? searchInput.match(completedRegex)[1] : null;
        const searchQuery = searchInput.replace(dateRegex, '').replace(completedRegex, '').trim();

        let queryString = 'tasks';

        if (searchQuery) {
            queryString += `?q=${encodeURIComponent(searchQuery)}`;
        }

        if (date) {
            queryString += `${searchQuery ? '&' : '?'}d=${encodeURIComponent(date)}`;
        }

        if (completed !== null ) {
            queryString += `${searchQuery || date ? '&' : '?'}c=${completed}`;
        }

        window.location.href = queryString;
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
                await fetch(`/app/tasks`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ taskId, completed: isCompleted })
                });
        
                console.log('Task marked as completed');
            } catch (error) {
                console.error('Error marking task as completed:', error);
            }
        });
    });
});

async function deleteTask(taskId, title) {
    console.log('Deletion started');

    const confirmed = confirm(`Are you sure you want to delete "${title}"?`);
    
    if (!confirmed) {
        return;
    }

    try {
        const response = await fetch(`/app/tasks`, {
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
                console.log("Task deleted successfully.");
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

function editTask(task_id) {
    const taskRow = document.getElementById(`task-row-${task_id}`);
    const titleInput = taskForm.elements['title'];
    const descriptionInput = taskForm.elements['description'];
    const dueDateInput = taskForm.elements['dueDate'];
    const priorityInput = taskForm.elements['priority']
    
    titleInput.value = taskRow.cells[1].textContent;
    descriptionInput.value = taskRow.cells[2].textContent;
    dueDateInput.value = taskRow.cells[3].textContent;
    priorityInput.value = taskRow.cells[4].textContent;

    taskForm.method = 'PUT';

    taskFormContainer.style.display = 'block';
    tasksContainer.style.display = 'none';;
}

const newUserButton = document.getElementById('new-user-button');
const usersContainer = document.getElementById('users-container');
const userFormContainer = document.getElementById('user-form-container');
const userForm = document.getElementById('user-form');

newUserButton.addEventListener('click', function() {
    userFormContainer.style.display = 'block';
    usersContainer.style.display = 'none';
});

function editUser(userId) {
    const userRow = document.getElementById(`user-row-${userId}`);
    const uidInput = userForm.elements['userid'];
    const usernameInput = userForm.elements['username'];
    const roleInput = userForm.elements['role'];
    
    uidInput.value = userId;
    usernameInput.value = userRow.cells[1].textContent;
    roleInput.value = userRow.cells[2].textContent;;

    userFormContainer.style.display = 'block';
    usersContainer.style.display = 'none';;
}
    
async function deleteUser(userId) {
    console.log('Deletion started');

    const confirmed = confirm(`Are you sure you want to delete user with ID: "${userId}"?`);
    
    if (!confirmed) {
        return;
    }

    try {
        const response = await fetch(`/app/users/${userId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const deletedRow = document.getElementById(`user-row-${userId}`);
            if (deletedRow) {
                deletedRow.remove();
                console.log("User deleted successfully.");
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