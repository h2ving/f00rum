const content = document.getElementById('content')



// Load the forum content
function loadForumContent() {
    const header = document.querySelector('header');
    const container = document.querySelector('.container');
    const loggedIn = `
            <a href="/" class="button-home">Real-Time Forum</a>
            <button id ="logout" type="submit">Log out</button>
    `;
    header.innerHTML = loggedIn;
    container.innerHTML = '<h1>Welcome to the Forum</h1>'; // Add more forum content as needed
}

// Load the login page with a registration option
function loadLoginPage() {
    const header = document.querySelector('header');
    const container = document.querySelector('.container');

    // Set the header with the login form
    const login = `
            <a href="/" class="button-home">Real-Time Forum</a>
            <form id="loginForm">
                <input type="text" name="nameoremail" placeholder="Username or Email" required>
                <input type="password" name="password" placeholder="Password" required>
                <button type="submit">Login</button>
            </form>
    `;

    // Set the main content with the registration form
    const register = `
        <h2>Join the Forum</h2>
        <form id="registrationForm">
            <input type="text" name="username" placeholder="Username" required>
            <input type="password" name="password" placeholder="Password" required>
            <input type="email" name="email" placeholder="E-mail" required>
            <input type="text" name="firstName" placeholder="First Name" required>
            <input type="text" name="lastName" placeholder="Last Name" required>
            <input type="number" name="age" placeholder="Age" required>
            <select name="gender" required>
                <option value="" disabled selected>Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
            </select>
            <button type="submit">Register</button>
        </form>
    `;
    header.innerHTML = login;
    container.innerHTML = register;
    document.getElementById('registrationForm').addEventListener('submit', async function(event) {
        event.preventDefault(); // Prevent default form submission

        // Collect data from the form
        const formData = new FormData(event.target);
        const data = {};
        formData.forEach((value, key) => {
            data[key] = value;
        });
        try {
            // Send data to the server
            const response = await fetch('/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            // Handle server's response
            if (response.ok) {
                alert(result.message); // Show success message
                // You can redirect the user to the forum page
                window.location.href = '/';

            } else {
                alert(result.error); // Show error message
            }
        } catch (error) {
            console.error('There was an error:', error);
            alert('Registration failed. Please try again.');
        }
    });

    document.getElementById('loginForm').addEventListener('submit', async function(event) {
        event.preventDefault(); // Prevent default form submission

        // Collect data from the form
        const formData = new FormData(event.target);
        const data = {};
        formData.forEach((value, key) => {
            data[key] = value;
        });

        try {
            // Send data to the server
            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            // Handle server's response
            if (response.ok) {
                alert(result.message); // Show success message
                // You can redirect the user to the forum page
                history.pushState({ page: 'forum' }, 'Forum', '/forum');
            } else {
                alert(result.error); // Show error message
            }
        } catch (error) {
            console.error('There was an error:', error);
            alert('Login failed. Please try again.');
        }
    });
    window.addEventListener('popstate', function(event) {
        if (event.state) {
            router(event.state);
        }
    });
}


function router(state) {
    switch (state.page) {
        case 'forum':
            loadForumContent();
            break;
        case 'login':
            loadLoginPage();
            break;
        default:
            // Handle 404 or redirect to a default page
            break;
    }
}


async function checkAuthentication1() {
    try {
        const response = await fetch('/check-auth');
        const data = await response.json();

        if (data.isAuthenticated) {
            loadForumContent();
        } else {

            loadLoginPage();
        }
    } catch (error) {
        console.error('Error checking authentication:', error);
        // Handle the error, maybe show a message to the user or reload the login page
    }
}

async function checkAuthentication() {
    try {
        const response = await fetch('/check-auth');
        const data = await response.json();

        if (data.isAuthenticated) {
            history.pushState({ page: 'forum' }, 'Forum', '/forum');
        } else {
            history.pushState({ page: 'login' }, 'Login', '/login');
        }
        router(history.state);
    } catch (error) {
        console.error('Error checking authentication:', error);
        // Handle the error, maybe show a message to the user or reload the login page
    }
}


window.onload = checkAuthentication;
