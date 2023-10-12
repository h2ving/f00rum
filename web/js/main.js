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
                //localStorage.clear();
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
    loadChatBox()
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
let socket;

function loadChatBox() {

    const container = document.querySelector('.container');
    container.innerHTML = `
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
    
    //Const for "enter" keylistener
    const messageInput = document.getElementById("chatInput");

    // Event listeners
    messageInput.addEventListener("keydown",function(event) {
    if (event.key === "Enter" &&  !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }});
    socket = new WebSocket("ws://localhost:8080/ws");
    socket.onmessage = function(event) {
        const message = JSON.parse(event.data);
        if (message.action === "send_message") {
            const chatMessagesDiv = document.querySelector('.chat-messages');
            const messageDiv = document.createElement('div');
            messageDiv.textContent = message.content;
            messageDiv.classList.add('recipient');
            chatMessagesDiv.appendChild(messageDiv);
            chatMessagesDiv.scrollTop = chatMessagesDiv.scrollHeight;
        }    
    };

// Populate the user list dynamically
    fetchUsers(function(users) {

        const userListDiv = document.querySelector('.chat-users');
        users.forEach(user => {
            const userDiv = document.createElement('div');
            userDiv.textContent = user;
            userDiv.onclick = function() {
                // Remove highlight from all users
                document.querySelectorAll('.chat-users div').forEach(div => {
                    div.classList.remove('selected-user');
                });
                // Highlight the clicked user
                this.classList.add('selected-user');
            };
            userListDiv.appendChild(userDiv);
        });
    });
}

// Function to fetch users from the server via WebSocket
function fetchUsers(callback) {

        // Send a message to request the user list
        const requestData = {
            action: "fetch_users"
        };
            // Check if the WebSocket is open and ready to send
    if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(requestData));
    } else {
        // If the WebSocket is not open, queue the fetch operation
        socket.addEventListener("open", function () {
            socket.send(JSON.stringify(requestData));
        });
    }


    // Listen for incoming WebSocket messages
    socket.addEventListener("message", (event) => {
        const message = JSON.parse(event.data);

        if (message.action === "update_users") {
            const userList = message.data;
            // Call a function to update the user list in the UI
            callback(Object.values(userList));
        }
    });
}

// Function to send a message
function sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value;
    if (message.trim() === '') return; // Don't send empty messages
    let jsonData = {};
    jsonData["action"] = "send_message";
    jsonData["sender"] = "Malvo";
    jsonData["recipient"] = document.querySelector('.selected-user').textContent;
    jsonData["content"] = message;
    socket.send(JSON.stringify(jsonData));

    // Update chat-messages with message
    const chatMessagesDiv = document.querySelector('.chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.textContent = message;
    messageDiv.classList.add('sender');
    chatMessagesDiv.appendChild(messageDiv);

    chatMessagesDiv.scrollTop = chatMessagesDiv.scrollHeight;
    

    input.value = ''; // Clear the input
}

// Function to clear localStorage after a specified time (e.g., 15 minutes)
function clearLocalStorage() {
    setTimeout(function () {
        localStorage.clear();
    }, 15 * 60 * 1000); // Convert minutes to milliseconds
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
