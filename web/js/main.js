import ChatBox from "./chatbox.js";

document.body.addEventListener('submit', async function(event) {
    if (event.target.id === 'registrationForm') {
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
                localStorage.setItem('username', JSON.stringify(data.username));
                //clearLocalStorage();
                alert(result.message); // Show success message
                // Redirect the user to the forum page
                router(history.state);
            } else {
                alert(result.error); // Show error message
            }
        } catch (error) {
            console.error('There was an error:', error);
            alert('Registration failed. Please try again.');
        }

    } else if (event.target.id === 'loginForm') {
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
                localStorage.setItem('username', JSON.stringify(data.username));
                //clearLocalStorage();
                // You can redirect the user to the forum page
                history.pushState({ page: 'forum' }, 'Forum', '/forum');
                router(history.state);
            } else {
                alert(result.error); // Show error message
            }
        } catch (error) {
            console.error('There was an error:', error);
            alert('Login failed. Please try again.');
        }
    }});
document.body.addEventListener('click', async function(event) {
    if (event.target.id === 'buttonHome') {
        event.preventDefault(); // Prevent the default behavior of the anchor tag
        await checkAuthentication(); // Assuming checkAuthentication is a function

    } else if (event.target.id === 'logout') {
        try {
            // Send data to the server
            const response = await fetch('/logout', {
                method: 'POST',
            });

            const result = await response.json();

            // Handle server's response
            if (response.ok) {
                localStorage.clear();
                // Redirect the user to the login page
                history.pushState({ page: 'login' }, 'Login', '/login');
                router(history.state);
            } else {
                alert(result.error); // Show error message
            }
        } catch (error) {
            console.error('There was an error:', error);
            alert('Login failed. Please try again.');
        }
        // Delete the session-token cookie
        document.cookie = "session-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    }
});
window.addEventListener('popstate', function(event) {
    if (event.state) {
        router(event.state);
    }
});

// Load the forum content
function loadForumContent() {
    const header = document.querySelector('header');
    const nameParagraph = document.createElement('p'); // Create a new <p> element
    nameParagraph.id = 'name'; // Set the id attribute
    //TODO Local Storage Korda
    const username = localStorage.getItem('username');
    //const username = "Malvo"
    nameParagraph.textContent = username.toString();
    const loggedIn = `
            <a href="#" id="buttonHome" class="button-home">Real-Time Forum</a>
            <button id="logout" type="button">Log out</button>
    `;
    header.innerHTML = loggedIn;
    header.insertBefore(nameParagraph, header.querySelector('#logout'));
    ChatBox.init()
}

// Load the login page with a registration option
function loadLoginPage() {
    const header = document.querySelector('header');
    const container = document.querySelector('.container');

    // Set the header with the login form
    const login = `
            <a href="/" class="button-home">Real-Time Forum</a>
            <form id="loginForm">
                <input type="text" name="user" placeholder="Username or Email" required>
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

function render() {
    const currentPath = window.location.pathname;
    switch (currentPath) {
        case '/forum':
            loadForumContent();
            break;
        case '/login':
            loadLoginPage();
            break;
        default:
            // Handle 404 or redirect to a default page
            break;
    }
}

window.onload = checkAuthentication;
