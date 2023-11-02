
const ForumFeed = (function () {
    var stateCategorySelector = false;
    // Load the forum content
    function init() {
        const container = document.querySelector('.feedContainer');
        container.innerHTML = `
        <div id="forum" class="forum-container">
            <div id="categories">
                <!-- Dynamically populated list of categories will appear here -->
            </div>
            <button id="create-thread-button" disabled>Create New Thread</button>
            <div id="threads">
                <!-- Dynamically populated list of threads will appear here -->
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

        // Fetch and populate the list of categories
        fetchCategories()

        // Set up event listeners for forum actions
        setupEventListeners();
    }

    function setupEventListeners() {
        // Event listener for each category to log the category ID
        const categoriesDiv = document.getElementById('categories');
        // Event listener for "Create New Thread" button
        const createThreadButton = document.getElementById('create-thread-button');
        // Event listener for the create thread modal's close button
        const closeModalButton = document.getElementById('closeModalButton');

        categoriesDiv.addEventListener('click', (event) => {
            if (event.target.tagName === 'DIV') {
                const categoryID = event.target.dataset.categoryID;
                //console.log("Now fetching threads with categoryID: ", categoryID)
                createThreadButton.removeAttribute('disabled');
                stateCategorySelector = true;
                fetchThreads(categoryID)

            }
        });
        createThreadButton.addEventListener("click", () => {
            showCreateThreadModal();
        });
        closeModalButton.addEventListener('click', () => {
            hideCreateThreadModal();
        });
        
        // Create new thread modal window submit button
        const submitModalButton = document.getElementById('submitModalButton');
        submitModalButton.addEventListener('click', () => {
            submitNewThread();
        });
    }

    // Function to show the create thread modal
    async function showCreateThreadModal() {
        const modal = document.getElementById('createThreadModal');
        modal.removeAttribute('disabled', 'hidden');
        modal.style.display = 'block';
        modal.style.cursor = 'default';
    }

    // Function to hide the create thread modal
    function hideCreateThreadModal() {
        const modal = document.getElementById('createThreadModal');
        modal.setAttribute('disabled', 'hidden');
        modal.style.display = 'none';
    }

    async function submitNewThread() {
        const title = document.getElementById('modalTitle').value;
        const content = document.getElementById('modalContent').value;
        const categoryID = document.getElementById('modalCategory').value;

        const newThread = {
            title,
            content,
            categoryID,
            userID: 1, // TODO: Replace with the actual user ID
        };

        try {
            const response = await fetch('/api/threads', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newThread),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            // Handle success (e.g., close modal, show success message, etc.)
            hideCreateThreadModal();
            console.log('Thread created successfully!');
            // You might want to fetch and display the updated threads after creating a new one
            fetchThreads(categoryID); // Optional - update the thread list after creating a new thread
        } catch (error) {
            console.error('Error creating thread:', error);
            // Handle the error - you might want to show an error message on the page
        }
    }

    //function to fetch Categories from /api/categories
    async function fetchCategories() {
        const categories = await fetch(`/api/categories`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                console.log('Received categories data: ', data);
                displayCategories(data);

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

    //function to fetch threads from /api/threads with categoryID
    async function fetchThreads(categoryID) {
        const threadsDiv = document.getElementById('threads');

        // Clear the existing threads before populating with new ones
        threadsDiv.innerHTML = '';

        try {
            const response = await fetch(`/api/threads?categoryID=${categoryID}`);

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            console.log(data);
            displayThreads(data);
        } catch (error) {
            console.error('Error fetching threads:', error);
            // Handle the error - you might want to show an error message on the page
        }
    }

    function displayCategories(categories) {
        const categoriesDiv = document.getElementById('categories');

        categories.forEach(category => {
            const categoryElement = document.createElement('div');
            categoryElement.textContent = category.title;
            categoryElement.dataset.categoryID = category.categoryID;

            categoriesDiv.appendChild(categoryElement);
        })
    }

    function displayThreads(threads) {
        const threadsDiv = document.getElementById('threads');

        threads.forEach(thread => {
            // Creating a custom div for each thread
            const threadElement = document.createElement('div');
            threadElement.classList.add('thread'); // Add class for styling

            // Title
            const titleElement = document.createElement('h3');
            titleElement.textContent = thread.title;
            threadElement.appendChild(titleElement);

            // Content
            const contentElement = document.createElement('p');
            contentElement.textContent = thread.content;
            threadElement.appendChild(contentElement);

            // Additional data attributes if needed
            threadElement.dataset.ThreadID = thread.ThreadID;
            // Add other data attributes as required

            // Append the custom thread element to the threads container
            threadsDiv.appendChild(threadElement);

            // Add event listener for when a thread is clicked
            threadElement.addEventListener('click', () => {
                // Your logic for handling the click event on a thread
                // For example, displaying the full content or opening the thread
                console.log('Thread ID:', thread.threadID);
                console.log('Full Content:', thread.content);
            });
        });
    }

    //Public methods
    return {
        init: init,
    };
})();

export default ForumFeed;