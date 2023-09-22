// Event listeners
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
                alert(result.message); // Show success message
                // You can redirect the user to the forum page
                history.pushState({ page: 'forum' }, 'Forum', '/forum');

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
    }});
// Event listeners
    window.addEventListener('popstate', function(event) {
        if (event.state) {
            router(event.state);
        }
    });
document.body.addEventListener('click', function(event) {
    if (event.target.id === 'buttonHome') {
        event.preventDefault(); // Prevent the default behavior of the anchor tag
        checkAuthentication(); // Assuming checkAuthentication is a function

    } else if (event.target.id === 'logout') {
        // Delete the session-token cookie
        document.cookie = "session-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

        // Redirect the user to the login page
        history.pushState({ page: 'login' }, 'Login', '/login');
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
    const container = document.querySelector('.container');
    const loggedIn = `
            <a href="#" id="buttonHome" class="button-home">Real-Time Forum</a>
            <button id="logout" type="button">Log out</button>
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

function loadChatBox() {
    const container = document.querySelector('.container');
    const chatBox = `
            <div id="chatBox" class="chat-box">
        <div class="chat-users">
            <!-- Dynamically populated list of users will appear here -->
        </div>
        <div class="chat-display">
            <div class="chat-messages">
                <!-- Chat messages will appear here -->
            </div>
            <input type="text" id="chatInput" placeholder="Type a message...">
            <button onclick="sendMessage()">Send</button>
        </div>
    </div>
    `;
    container.innerHTML = chatBox;

    // Sample user list. Replace with your actual user data.
    const users = ["Alice", "Bob", "Charlie", "David"];

// Populate the user list dynamically
    const userListDiv = document.querySelector('.chat-users');
    users.forEach(user => {
        const userDiv = document.createElement('div');
        userDiv.textContent = user;
        userDiv.onclick = function() {
            // Handle user click, e.g., start a chat with this user
        };
        userListDiv.appendChild(userDiv);
    });
}

// Function to send a message
function sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value;
    if (message.trim() === '') return; // Don't send empty messages

    const chatMessagesDiv = document.querySelector('.chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.textContent = message;
    chatMessagesDiv.appendChild(messageDiv);

    input.value = ''; // Clear the input

    // TODO: Send the message to the server or other users
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
window.onload = function() {
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
