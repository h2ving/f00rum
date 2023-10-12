

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
        fetchUsers(function (users) {
            const userListDiv = document.querySelector(".chat-users");
            users.forEach(user => {
                const userDiv = document.createElement("div");
                userDiv.textContent = user;
                userDiv.onclick = function () {
                    // Remove highlight from all users
                    document.querySelectorAll(".chat-users div").forEach(div => {
                        div.classList.remove("selected-user");
                    });
                    // Highlight the clicked user
                    this.classList.add("selected-user");
                    console.log(this.textContent);
                    handleUserSelection(this.textContent);
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
    function handleUserSelection(selectedUser) {
        // Clear the chat-messages div
        const chatMessagesDiv = document.querySelector(".chat-messages");
        chatMessagesDiv.innerHTML = "";

        // Send a request to the server to fetch chat history for the selected user
        const requestData = {
            action: "fetch_chat_history",
            user: selectedUser, // You may need to modify your server to handle this request
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
            displayChatHistory(message.content);
        }
        // else if (message.action === "update_users") {
        //     // Display chat history
        //     displayUsers(message.content);
    }

    // function displayUsers(message) {
    //     }
    // }

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
        history.forEach((message) => {
            const messageDiv = document.createElement("div");
            messageDiv.textContent = message.content;
            messageDiv.classList.add(message.class === "sender" ? "sender" : "recipient");
            chatMessagesDiv.appendChild(messageDiv);
        });
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
