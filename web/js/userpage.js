import ForumFeed from "./forum.js"

const UserPage = (function () {

    function init() {
        const container = document.querySelector('.feedContainer');
        container.innerHTML = `
        <div id="userpage" class="userpage-container">
            <h2 id="username">Loading...</h2>
            <h3>Your threads</h3>
            <div id="user-threads">
                <!-- populated list of threads by user -->
            </div>
            <h3>Your upvotes</h3>
            <div id="upvoted-threads">  
                <!-- populated list of upvoted threads -->
            </div>
        </div>
        `;

        fetchUser();
        fetchUserThreads();
        fetchUpvotedThreads();
    }


    function fetchUser() {
        const username = localStorage.getItem('username');
        const usernameElement = document.getElementById('username');
        usernameElement.textContent = username;
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
            await ForumFeed.displayThreads(data, 'upvoted-threads');
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
            await ForumFeed.displayThreads(data, 'user-threads');
        } catch (error) {
            console.error('Error fetching user created threads: ', error);
            // Handle error - show error message on the page
        }
    }



    // Public method
    return {
        init: init,
    };
})();

export default UserPage;