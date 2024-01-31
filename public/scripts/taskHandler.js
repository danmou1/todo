function deleteTask(taskId, title) {
    console.log('Deletion started');
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
        fetch(`/app/tasks/${taskId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(res => {
            if (res.ok) {
                console.log("Task deleted successfully.");
            } else {
                console.error("Error deleting task");
            }
        })
        .catch(error => {
            console.error("Error:", error);
        })
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const newTaskButton = document.getElementById('new-task-button');
    const formContainer = document.getElementById('form-container');
    const tasksContainer = document.getElementById('tasks-container');

    newTaskButton.addEventListener('click', function () {
        formContainer.style.display = 'block';
        tasksContainer.style.display = 'none';
    });
});
