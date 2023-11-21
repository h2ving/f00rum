const UserPage = (function () {

    function init() {
        const container = document.querySelector('.feedContainer');
        container.innerHTML = `
        <div id="userpage" class="userpage-container">
            <h3 id="username">Loading...</h3>
            <div id="user-threads">
                <!-- populated list of threads by user -->
            </div>
            <div id="upvoted-threads">
                <!-- populated list of upvoted threads -->
            </div>
        </div>
        `;

        setupEventListeners();
        fetchUser();
        fetchUserThreads();
        fetchUpvotedThreads();
    }

    function setupEventListeners() {
        // Event listeners for undoing the upvotes on threads and comments

        // Event listener for closing the user page

        // Event listener for opening the threads
    }

    function fetchUser() {
        const username = localStorage.getItem('username');
        const usernameElement = document.getElementById('username');
        usernameElement.textContent = username;

        // Fetch user data from be
    }

    async function fetchUpvotedThreads() {
        const threadsDiv = document.getElementById('upvoted-threads');
        const username = localStorage.getItem('username');

        threadsDiv.innerHTML = '';

        try {
            const upvotedThreads = await fetch(`/api/uservotes?username=${username}`)
            if (!upvotedThreads.ok) {
                throw new Error('Error fetching upvoted threads: Network response not ok');
            }

            const data = await upvotedThreads.json();
            displayThreads(data, 'upvoted-threads');
        } catch (error) {
            console.error('Error fetching user upvoted threads: ', error);
            // Handle error - show error message on the page
        }
    }

    async function fetchUserThreads() {
        const threadsDiv = document.getElementById('user-threads');
        const username = localStorage.getItem('username');

        // Clear existing threads before fetching new data
        threadsDiv.innerHTML = '';

        try {
            const userThreads = await fetch(`/api/user?username=${username}`)

            if (!userThreads.ok) {
                throw new Error('Network response was not ok for fetching user threads');
            }

            const data = await userThreads.json();
            displayThreads(data, 'user-threads');
        } catch (error) {
            console.error('Error fetching user created threads: ', error);
            // Handle error - show error message on the page
        }
    }

    function displayThreads(threads, threadType) {
        const threadsDiv = document.getElementById(threadType);

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
            threadElement.setAttribute('id', thread.threadID);
            // Add other data attributes as required

            // Append the custom thread element to the threads container
            threadsDiv.appendChild(threadElement);

            // Add event listener for when a thread is clicked
            // threadElement.addEventListener('click', async () => {
            //     // Your logic for handling the click event on a thread
            //     // For example, displaying the full content or opening the thread
            //     console.log('Thread ID:', thread.threadID);
            //     console.log('Full Content:', thread.content);
            //     await displayThreadContent(thread);
            // });
        });
    }

    // Public method
    return {
        init: init,
    };
})();

export default UserPage;