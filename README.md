# F00RUM

## Overview

This Real-Time Forum Application is designed to facilitate user interactions, including registration, login, forum feed viewing, chat functionalities, and user-specific pages.

## Features

### User Authentication

- **Registration**: Allows users to register by providing username, password, email, first name, last name, age, and gender.
- **Login**: Enables existing users to log in with their credentials.
- **Logout**: Logs out authenticated users.

### Forum

- **Forum Feed**: Displays forum threads and allows users to interact with threads and posts.
- **Thread Creation**: Enables users to create new threads in various categories.

### Chat

- **Chat Box**: Provides real-time chat functionality, allowing users to engage in conversations.

### User Page

- **Profile Display**: Shows user-specific information and activities.
- **Navigation**: Allows users to navigate across different sections of the application.

## Code Structure

### File Structure

- **`index.html`**: Main HTML file for the application layout.
- **`styles.css`**: Cascading Style Sheets (CSS) file for styling the application.
- **`main.js`**: JavaScript file containing the main logic and event listeners.
- **`chatbox.js`**: JavaScript file handling chat functionalities.
- **`forum.js`**: JavaScript file managing forum functionalities.
- **`userpage.js`**: JavaScript file handling user-specific functionalities.

#### Filetree

```bash
.
├── db
│   ├── database.db
│   ├── database.go
│   ├── database.sql
│   ├── mockup.sql
│   └── ThreadsPopulate.sql
├── forum.session.sql
├── go.mod
├── go.sum
├── main.go
├── README.md
├── server
│   ├── chat
│   │   ├── chat_functions.go
│   │   ├── client.go
│   │   ├── hub.go
│   │   └── structs.go
│   ├── forum
│   │   ├── forum_functions.go
│   │   └── structs.go
│   ├── functions
│   │   └── sessions.go
│   ├── handlers
│   │   ├── handlers.go
│   │   ├── login_handlers.go
│   │   ├── posts_handlers.go
│   │   ├── registration_handlers.go
│   │   └── userpage_handlers.go
│   ├── structs.go
│   └── userpage
│       ├── structs.go
│       └── userpage_functions.go
└── web
    ├── forum.session.sql
    ├── js
    │   ├── chatbox.js
    │   ├── forum.js
    │   ├── main.js
    │   └── userpage.js
    └── static
        ├── favicon.ico
        ├── index.html
        └── styles.css

11 directories, 33 files
```

### Key Components

#### `main.js`

- **Event Listeners**: Manages form submissions, clicks, and history changes.
- **Router Function**: Routes to different sections based on the provided state.
- **Authentication Functions**: Verifies user authentication status.

#### `chatbox.js`

- **ChatBox Module**: Handles real-time chat functionalities.
- **Initialization**: Initializes chat functionalities within the application.

#### `forum.js`

- **ForumFeed Module**: Manages forum feed functionalities.
- **Thread Handling**: Creates, displays, and manages forum threads.

#### `userpage.js`

- **UserPage Module**: Manages user-specific page functionalities.
- **Profile Display**: Handles the display of user information and activities.

## Usage

### Dependencies

- **Frontend**:
  - HTML, CSS, JavaScript
  - Fetch API for HTTP requests

### Instructions

1. **Setup**: Clone the repository and host the application on a web server.
2. **Execution**: go run . and open localhost:8080 on browser.
3. **Usage**: You can create your own account or use test accounts: Anna (password: anna) and Jake (password: jake)
   

## Contributors

- h2ving
- ecce75
- AndreiTuhkru

## Future Improvements

- Enhance UI/UX for a more intuitive experience.
- Implement more robust error handling for form submissions and API requests.
