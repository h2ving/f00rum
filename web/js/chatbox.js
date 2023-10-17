

// Wrap your code in a module for better encapsulation
const ChatBox = (function () {
    let socket;


    // Function to initialize the chat app
    function init() {
        // Create the chat box structure and set up event listeners
        const container = document.querySelector(".container");
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
                <button id="sendButton">Send</button>
              </div>
            </div>
          `;


        setupSocket(); // Set up the WebSocket connection
        setupEventListeners(); // Set up other event listeners

        // Dynamically populate the user list
        fetchUsers();
    }

    // Function to fetch users from the server via WebSocket
    function fetchUsers() {
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
    }

    // Function to set up the WebSocket connection
    function setupSocket() {
        socket = new WebSocket("ws://localhost:8080/ws");
        socket.onmessage = handleIncomingMessage;
    }

    // Function to set up event listeners
    function setupEventListeners() {
        const messageInput = document.getElementById("chatInput");
        messageInput.addEventListener("keydown", function (event) {
            if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                sendMessage();
            }
        });

        const sendButton = document.getElementById("sendButton");
        // Add a click event listener to it
        sendButton.addEventListener("click", function () {
            sendMessage(); // Call the sendMessage() function from the ChatBox module
        });
    }


    // Function to handle user selection
    function handleUserSelection(key) {
        // Clear the chat-messages div
        const chatMessagesDiv = document.querySelector(".chat-messages");
        chatMessagesDiv.innerHTML = "";

        // Send a request to the server to fetch chat history for the selected user
        const requestData = {
            action: "fetch_chat_history",
            user: key, // You may need to modify your server to handle this request
        };

        // Send the request via WebSocket
        if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify(requestData));
        } else {
            socket.addEventListener("open", function () {
                socket.send(JSON.stringify(requestData));
            });
        }
    }

    // Function to handle incoming WebSocket messages
    function handleIncomingMessage(event) {
        const message = JSON.parse(event.data);
        if (message.action === "send_message") {
            displayMessage(message);
        } else if (message.action === "chat_history") {
            // Display chat history
            //console.log(message.content)
            displayChatHistory(message.content);
        } else if (message.action === "update_users") {
            // Display chat history
            displayUsers(message.data);
        }
    }

    let Key;


    function displayUsers(users) {
        const userListDiv = document.querySelector(".chat-users");
        Object.entries(users).forEach(([key, user]) => {
            const userDiv = document.createElement("div");
            userDiv.textContent = user;
            userDiv.id = `${key}`;
            userDiv.onclick = function () {
                // Remove highlight from all users
                document.querySelectorAll(".chat-users div").forEach(div => {
                    div.classList.remove("selected-user");
                });
                // Highlight the clicked user
                this.classList.add("selected-user");
                Key = key;
                console.log("this is ", Key)
                handleUserSelection(key);
            };
            userListDiv.appendChild(userDiv);
        });
    }

    // Function to display a message in the chat
    function displayMessage(message) {
        const chatMessagesDiv = document.querySelector(".chat-messages");
        const messageDiv = document.createElement("div");
        messageDiv.textContent = message.content;
        messageDiv.classList.add(message.class === "sender" ? "sender" : "recipient");
        chatMessagesDiv.appendChild(messageDiv);
        chatMessagesDiv.scrollTop = chatMessagesDiv.scrollHeight;
    }

    // Function to display chat history
    function displayChatHistory(history) {
        const chatMessagesDiv = document.querySelector(".chat-messages");
        console.log(history)
        if (!(history === null)) {
            history.forEach((message) => {
                const messageDiv = document.createElement("div");
                messageDiv.textContent = message["Message"];
                console.log(message)
                console.log(typeof message["SenderID"])
                console.log(typeof +Key)
                messageDiv.classList.add(message["SenderID"] === +Key ? "sender" : "recipient");
                chatMessagesDiv.appendChild(messageDiv);
            });
            chatMessagesDiv.scrollTop = chatMessagesDiv.scrollHeight;
        }
    }

    // Function to send a message
    function sendMessage() {
        const input = document.getElementById("chatInput");
        const message = input.value;
        if (message.trim() === "") return;

        const jsonData = {
            action: "send_message",
            sender: "Malvo",
            recipient: document.querySelector(".selected-user").textContent,
            content: message,
        };
        socket.send(JSON.stringify(jsonData));

        // Update chat-messages with the message
        displayMessage({ class: "sender", content: message });

        input.value = ""; // Clear the input
    }

    // Public methods
    return {
        init: init,
    };
})();

export default ChatBox;
