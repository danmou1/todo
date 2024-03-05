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
            console.log(response)
        } else {
            const { error } = await response.json();
            console.log(error);
            console.error('Registration error:', error);
        }
    } catch (err) {
        console.error('Error during registration:', err);
    }
});