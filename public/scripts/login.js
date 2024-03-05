document.getElementById('loginForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    const formData = new FormData(this);
    const username = formData.get('username');
    const password = formData.get('password');

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        if (response.ok) {
            const data = await response.json();
            const token = data.token;

            sessionStorage.setItem('token', token);

            window.location.href = '/app';
        } else {
            const errorMessage = await response.text();
            console.error('Login error:', errorMessage);
        }
    } catch (err) {
        console.error('Error during login:', err);
    }
});