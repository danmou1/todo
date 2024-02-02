async function deleteTask(taskId, title) {
    console.log('Deletion started');

    const confirmed = confirm(`Are you sure you want to delete "${title}"?`);
    
    if (!confirmed) {
        return;
    }

    try {
        const response = await fetch(`/app/tasks/${taskId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
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

document.addEventListener('DOMContentLoaded', function() {
    const newTaskButton = document.getElementById('new-task-button');
    const formContainer = document.getElementById('form-container');
    const tasksContainer = document.getElementById('tasks-container');

    newTaskButton.addEventListener('click', function () {
        formContainer.style.display = 'block';
        tasksContainer.style.display = 'none';
    });
});