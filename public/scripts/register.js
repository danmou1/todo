document.getElementById('register-form').addEventListener('submit', async function(event) {
    event.preventDefault();
    const formData = new FormData(this);
    const username = formData.get('username');
    const password = formData.get('password');

    try {
        const response = await fetch('/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        if (response.ok) {
            window.location.href = '/login';
        } else {
            const { error } = await response.json();

            const errorElement = document.getElementById('login-error');
            errorElement.textContent = error;
            errorElement.style.display = 'block';
        }
    } catch (err) {
        console.error('Error during registration:', err);

        const errorElement = document.getElementById('login-error');
        errorElement.textContent = 'An error occurred during registration. Please try again.'
        errorElement.style.display = 'block';
    }
});