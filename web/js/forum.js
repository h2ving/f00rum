
// Function to initialize the forum page
function initForumPage() {
    // Load the forum content when the page loads
    loadForumContent();

    // Set up event listeners for forum actions
    setupEventListeners();
}

// Load the forum content
function loadForumContent() {
    const container = document.querySelector('.container');
    container.innerHTML = `
        <div id="forum" class="forum-container">
            <h1>Forum</h1>
            <button id="create-thread-button">Create New Thread</button>
            <div id="threads" class="threads">
                <!-- Dynamically populated list of threads will appear here -->
            </div>
            <div id="threadDetails" class="thread-details">
                <h2>Thread Title</h2>
                <div id="posts" class="posts">
                    <!-- Dynamically populated list of posts will appear here -->
                </div>
                <form id="createPostForm">
                    <input type="text" name="postContent" placeholder="Add a post...">
                    <button type="submit">Post</button>
                </form>
            </div>
        </div>
        <div id="createThreadModal" class="modal" >
            <div class="modal-content">
                <span id="closeModalButton" class="close-button">&times;</span>
                <h2>Create a New Thread</h2>
                <form id="modalForm">
                    <label for="modalTitle">Title:</label>
                    <input type="text" id="modalTitle" name="modalTitle">
                    <label for="modalContent">Content:</label>
                    <textarea id="modalContent" name="modalContent"></textarea>
                    <label for="modalCategory">Category:</label>
                    <select id="modalCategory" name="modalCategory"></select>
                    <button id="submitModalButton" type="button">Create Thread</button>
                </form>
            </div>
        </div>
    `;
    // Fetch and populate the list of threads
    fetchThreads();

    // Fetch and populate the categories in the create thread modal
    fetchCategories();
}

// Function to fetch and populate the categories in the create thread modal
function fetchCategories() {
    // Make an API request to get the list of categories
    fetch('/api/categories')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Received categories data:', data);

            const modalCategorySelect = document.getElementById('modalCategory');
            data.forEach(category => {
                const option = document.createElement('option');
                option.value = category.categoryID;
                option.textContent = category.title;
                modalCategorySelect.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error fetching categories:', error);
        });
}


// Function to show the create thread modal
function showCreateThreadModal() {
    const modal = document.getElementById('createThreadModal');
    modal.style.display = 'block';
}

// Function to hide the create thread modal
function hideCreateThreadModal() {
    const modal = document.getElementById('createThreadModal');
    modal.style.display = 'none';
}

// Fetch and populate the list of threads with categoryID query parameter
function fetchThreads() {
    // Make an API request to get the list of threads with the categoryID
    fetch(`/api/threads`)
        .then(response => response.json())
        .then(data => {
            displayThreads(data);
        })
        .catch(error => {
            console.error('Error fetching threads:', error);
        });
}

// Display the list of threads
function displayThreads(threads) {
    const threadsDiv = document.getElementById('threads');
    threads.forEach(thread => {
        const threadDiv = document.createElement('div');
        threadDiv.textContent = thread.title;
        threadDiv.addEventListener('click', () => {
            // Handle thread selection
            displayThreadDetails(thread);
        });
        threadsDiv.appendChild(threadDiv);
    });
}

// Display posts for a selected thread
function displayThreadDetails(thread) {
    const threadDetailsDiv = document.getElementById('threadDetails');
    const postsDiv = document.getElementById('posts');

    // Set the thread title
    const threadTitle = threadDetailsDiv.querySelector('h2');
    threadTitle.textContent = thread.title;

    // Clear the posts
    postsDiv.innerHTML = '';

    // Fetch and display posts for the selected thread
    fetchPosts();
}

// Fetch posts for a specific thread using threadID from the query parameters
function fetchPosts() {
    // Use URLSearchParams to parse the query parameters
    const urlSearchParams = new URLSearchParams(window.location.search);
    const threadID = urlSearchParams.get("threadID");

    // Make an API request to get the posts for the selected thread
    fetch(`/api/posts?threadID=${threadID}`)
        .then(response => response.json())
        .then(data => {
            displayPosts(data);
        })
        .catch(error => {
            console.error('Error fetching posts:', error);
        });
}

// Display posts
function displayPosts(posts) {
    const postsDiv = document.getElementById('posts');
    posts.forEach(post => {
        const postDiv = document.createElement('div');
        postDiv.textContent = post.content;
        postsDiv.appendChild(postDiv);
    });
}

// Set up event listeners for forum actions
function setupEventListeners() {
    const createPostForm = document.getElementById('createPostForm');
    createPostForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const formData = new FormData(createPostForm);
        const postContent = formData.get('postContent');
        if (postContent.trim() === '') return;

        // Use URLSearchParams to parse the query parameters
        const urlSearchParams = new URLSearchParams(window.location.search);
        const currentThreadID = urlSearchParams.get("threadID");

        // Make an API request to create a new post
        fetch('/api/posts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                threadID: currentThreadID, // Use the threadID from the query parameters
                content: postContent,
            }),
        })
            .then(response => response.json())
            .then(data => {
                // Handle the response (e.g., refresh the posts)
                forumRefresh();
            })
            .catch(error => {
                console.error('Error creating post:', error);
            });
    });

    // Event listener for "Create New Thread" button
    const createThreadButton = document.getElementById('create-thread-button');
    createThreadButton.addEventListener('click', () => {
        showCreateThreadModal();
    });

    // Event listener for the create thread modal's close button
    const closeModalButton = document.getElementById('closeModalButton');
    closeModalButton.addEventListener('click', () => {
        hideCreateThreadModal();
    });

    // Event listener for the create thread modal's submit button
    const submitModalButton = document.getElementById('submitModalButton');
    submitModalButton.addEventListener('click', () => {
        const title = document.getElementById('modalTitle').value;
        const content = document.getElementById('modalContent').value;
        const categoryID = document.getElementById('modalCategory').value;

        if (title && content && categoryID) {
            // Make an API request to create a new thread
            fetch('/api/threads', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: title,
                    content: content,
                    categoryID: categoryID,
                }),
            })
                .then(response => response.json())
                .then(data => {
                    hideCreateThreadModal();
                    // Handle the response (e.g., refresh the threads)
                    forumRefresh();
                })
                .catch(error => {
                    console.error('Error creating thread:', error);
                });
        }
    });
}

// Function to refresh the posts for the currently selected thread
function forumRefresh() {
    // Use URLSearchParams to parse the query parameters
    const urlSearchParams = new URLSearchParams(window.location.search);
    const threadID = urlSearchParams.get("threadID");

    // Make an API request to get the updated posts for the selected thread
    fetch(`/api/posts?threadID=${threadID}`)
        .then(response => response.json())
        .then(data => {
            displayPosts(data);
        })
        .catch(error => {
            console.error('Error fetching posts:', error);
        });
}

// Initialize the forum page
export { initForumPage };
