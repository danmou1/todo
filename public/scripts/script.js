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

let isEdit = false;
let formTaskId = '';

function editTask(taskId) {
    const taskRow = document.getElementById(`task-row-${taskId}`);
    const titleInput = taskForm.elements['title'];
    const descriptionInput = taskForm.elements['description'];
    const dueDateInput = taskForm.elements['dueDate'];
    const priorityInput = taskForm.elements['priority']
    
    titleInput.value = taskRow.cells[1].textContent;
    descriptionInput.value = taskRow.cells[2].textContent;
    dueDateInput.value = taskRow.cells[3].textContent;
    priorityInput.value = taskRow.cells[4].textContent;

    taskFormContainer.style.display = 'block';
    tasksContainer.style.display = 'none';

    isEdit = true;
    formTaskId = taskId;
};

function submitForm(taskId) {
    const formData =  {
        title: document.getElementById('title').value,
        description: document.getElementById('description').value,
        dueDate: document.getElementById('dueDate').value,
        priority: document.getElementById('priority').value,
    };

    if (taskId) {
        formData.taskId = (taskId);
    }

    console.log('submitform called');

    const method = isEdit ? 'PUT' : 'POST';

    fetch('/app/tasks', {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
    .then(res => {
        if (res.ok) {
            locationreload();
        }
    })
    .catch(err => {
        console.error('Error submitting task:', err);
    })
}