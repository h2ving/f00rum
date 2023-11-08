
let UserID;
// Wrap your code in a module for better encapsulation
const ChatBox = (function () {
    let socket;
    let selectedUser;

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
    let currentPage; // Initialize with the first page
    let chatMessagesDiv;
    let allFetched;
    let start = false;
    // Function to handle user selection and load chat history
    function fetchMessages(key) {
        console.log("THIS IS FETCH", key)
        // Clear the chat-messages div
        chatMessagesDiv = document.querySelector(".chat-messages");
        if (selectedUser !== key) {
            allFetched = false;
            currentPage = 1;
            selectedUser = key;
            start = true
            chatMessagesDiv.innerHTML = "";
        }

        // Send a request to the server with the current page number
        const requestData = {
            action: "fetch_chat_history",
            user: key,
            page: currentPage, // Send the current page
        };
        // Send the request via WebSocket
        socket.send(JSON.stringify(requestData));

        // Increment the page for the next request
        currentPage++;
    }
    // Function to load more chat history when the user scrolls
    function loadMoreMessages() {
        //chatMessagesDiv = document.querySelector(".chat-messages");
    if (!start) {
            const scrollOffset = chatMessagesDiv.scrollTop;
            // Check if the user has scrolled to the top (you can adjust the threshold)
            if (scrollOffset < 20 && currentPage > 1 && !allFetched) {
                // Send a request for more chat history
                fetchMessages(selectedUser);
            }
        }else {
            start = false;
        }
    }

    // Function to handle incoming WebSocket messages
    function handleIncomingMessage(event) {
        const message = JSON.parse(event.data);
        if (message.action === "send_message") {
            console.log("sender: ", message["sender"])
            console.log("selectedUser", selectedUser)
            if (message["sender"] != selectedUser){
                handleNewMessageNotification(message["sender"]);
                console.log("yo")
            }else {
                displayMessage(message);
            }
        } else if (message.action === "chat_history") {
            // Display chat history
            displayChatHistory(message.content);
        } else if (message.action === "update_users") {
            // Display chat history
            displayUsers(message.data);
        } else if (message.action === "newUser")  {
            if (message.data != UserID) {
                NewUserStatus(message.data)
            }
        } else if (message.action === "disconnectUser")  {
            if (message.data != UserID) {
                DisconnectedUserStatus(message.data)
            }
        }
    }

    let isBlinking = false;

    function handleNewMessageNotification(user) {
        if (!isBlinking) {
            isBlinking = true;
            const userDiv = document.querySelector(`#user${user}`);
            const statusSpan = userDiv.querySelector("span");

            const originalStatusClass = statusSpan.className;
            let isBlinkOn = false;

            const blinkInterval = setInterval(() => {
                if (isBlinkOn) {
                    statusSpan.classList.remove("blink");
                    isBlinkOn = false;
                } else {
                    statusSpan.classList.add("blink");
                    isBlinkOn = true;
                }
            }, 500);

            // Stop blinking after the user clicks on the user div
            userDiv.onclick = function () {
                clearInterval(blinkInterval);
                statusSpan.className = originalStatusClass; // Restore the original status class
                isBlinking = false;

                document.querySelectorAll(".chat-users div").forEach(div => {
                    div.classList.remove("selected-user");
                });
                // this.classList.remove('new-message')
                // Highlight the clicked user
                this.classList.add("selected-user");
                const match = userDiv.id.match(/(\d+)/);
                const userID = parseInt(match[0], 10)
                console.log("Selected user", match[0])
                fetchMessages(match[0]);
            };
        }
    }


    function NewUserStatus(id) {
        const user = document.getElementById(`user${id}`);
        const status = user.querySelector('span')


        //const divElement = document.querySelector(`#user${id} span`);

        status.classList.remove("offline");
        status.classList.add("online");
    }

    function DisconnectedUserStatus(id) {
        const user = document.getElementById(`user${id}`);
        const status = user.querySelector('span')


        //const divElement = document.querySelector(`#user${id} span`);

        status.classList.remove("online");
        status.classList.add("offline");
    }

    function displayUsers(users) {
        const userListDiv = document.querySelector(".chat-users");
        const username = localStorage.getItem('username');
        let firstUser = true; // Track if it's the first user

        Object.entries(users).forEach(([key, user]) => {
            if (user.Username === username) {
                UserID = key;
            } else {
                const userDiv = document.createElement("div");
                const username = document.createElement("div");

                userDiv.textContent = user.Username;
                userDiv.id = `user${key}`;

                if (firstUser) {
                    userDiv.classList.add("selected-user");
                    firstUser = false; // Set it to false after the first user
                    fetchMessages(key);
                }
                userDiv.onclick = function () {
                    // Remove highlight from all users
                    document.querySelectorAll(".chat-users div").forEach(div => {
                        div.classList.remove("selected-user");
                    });
                    //this.classList.remove('new-message')
                    // Highlight the clicked user
                    this.classList.add("selected-user");
                    fetchMessages(key);
                };

                // Add online status indicator
                const onlineStatus = document.createElement("span");
                if (user.Online) {
                    onlineStatus.classList.add("online");
                } else{
                    onlineStatus.classList.add("offline");
                }

                userDiv.append(onlineStatus);
                userListDiv.append(userDiv);
            }
        });
    }

    

    // Function to display a message in the chat
    function displayMessage(message) {
        const messageDiv = document.createElement("div");
        messageDiv.textContent = message.content;
        messageDiv.classList.add(message.class === "sender" ? "sender" : "recipient");
        chatMessagesDiv.appendChild(messageDiv);
        chatMessagesDiv.scrollTop = chatMessagesDiv.scrollHeight;
    }

    let savedScrollHeight;
    // Function to display chat history
    function displayChatHistory(history) {
        if (history.length !== 0) {
            savedScrollHeight = chatMessagesDiv.scrollHeight;
            history.forEach((message) => {
                const messageDiv = document.createElement("div");
                messageDiv.textContent = message["Message"];
                messageDiv.classList.add(message["SenderID"] === +selectedUser ? "recipient" : "sender");
                chatMessagesDiv.insertBefore(messageDiv, chatMessagesDiv.firstChild);
            });
            //chatMessagesDiv.scrollTop = chatMessagesDiv.scrollHeight;
            if (start) {
                chatMessagesDiv.scrollTop = chatMessagesDiv.scrollHeight;
                //start = false
            } else {
                chatMessagesDiv.scrollTop = chatMessagesDiv.scrollHeight - savedScrollHeight + 20;
            }
            chatMessagesDiv.addEventListener("scroll", loadMoreMessages);
        } else {
            allFetched = true
        }
    }

    // Function to send a message
    function sendMessage() {
        const input = document.getElementById("chatInput");
        const message = input.value;
        if (message.trim() === "") return;

        const jsonData = {
            action: "send_message",
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
console.log(UserID)
export {UserID};
