import { UserID } from "./chatbox.js";

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
            <h3>Your votes</h3>
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
            threadElement.addEventListener('click', async () => {
                // Your logic for handling the click event on a thread
                // For example, displaying the full content or opening the thread
                // console.log('Thread ID:', thread.threadID);
                // console.log('Full Content:', thread.content);
                await displayThreadContent(thread);
            });
        });
    }

    async function fetchComments(threadID) {
        try {
            const response = await fetch(`/api/comments?threadID=${threadID}`);

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            return data; //Return the fetched comments
        } catch (error) {
            console.error('Error fetching comments:', error);
            // TODO: handle error
        }
    }

    async function displayThreadContent(thread) {

        //Overlay modal
        const overlay = document.createElement('div');
        overlay.classList.add('overlay');
        overlay.id = "overlay";

        const threadContentModal = document.createElement('div');
        threadContentModal.classList.add('thread-content-modal');

        // Close button
        const closeButton = document.createElement('span');
        closeButton.innerHTML = '&times;';
        closeButton.classList.add('close-button');
        closeButton.addEventListener('click', () => {
            // Close the modal and overlay
            //threadContentModal.style.display = 'none';
            //overlay.style.display = 'none';
            document.querySelector("#overlay").remove(); //REMOVE OVERLAY ELEMENT FROM DOM
        });
        threadContentModal.appendChild(closeButton);


        const originalThreadContent = document.createElement('div');
        originalThreadContent.classList.add('thread-main-element');
        // Title
        const titleElement = document.createElement('h3');
        titleElement.textContent = thread.title;
        originalThreadContent.appendChild(titleElement);

        // Author
        const threadAuthor = document.createElement('small');
        threadAuthor.textContent = thread.username;
        threadAuthor.style.color = '#009882';
        originalThreadContent.appendChild(threadAuthor);

        // Content
        const contentElement = document.createElement('p');
        contentElement.textContent = thread.content;
        originalThreadContent.appendChild(contentElement);

        const threadupvotes = await fetchVotes(thread.threadID)
        /// Thread upvote Button
        const threadupvoteButton = document.createElement('button');
        threadupvoteButton.innerHTML = '<span>&uarr;</span> <span class="upvote-count">' + threadupvotes.upvotes + '</span>';
        threadupvoteButton.classList.add('upvote-button');
        threadupvoteButton.addEventListener('click', async () => {
            const updatedvotes = await handleVote(thread.threadID, 'upvote', "thread");
            threadupvoteButton.querySelector('.upvote-count').textContent = updatedvotes.upvotes;
            threaddownvoteButton.querySelector('.downvote-count').textContent = updatedvotes.downvotes;
        });
        originalThreadContent.appendChild(threadupvoteButton);

        // Thread downvote Button
        const threaddownvoteButton = document.createElement('button');
        threaddownvoteButton.innerHTML = '<span>&darr;</span> <span class="downvote-count">' + threadupvotes.downvotes + '</span>';
        threaddownvoteButton.classList.add('downvote-button');
        threaddownvoteButton.addEventListener('click', async () => {
            const updatedvotes = await handleVote(thread.threadID, 'downvote', "thread");
            threadupvoteButton.querySelector('.upvote-count').textContent = updatedvotes.upvotes;
            threaddownvoteButton.querySelector('.downvote-count').textContent = updatedvotes.downvotes;
        });
        originalThreadContent.appendChild(threaddownvoteButton);

        // append the main thread div to the whole content modal
        threadContentModal.appendChild(originalThreadContent);

        ///COMMENTS
        const comments = await fetchComments(thread.threadID);
        if (comments && comments.length > 0) {
            const commentsList = document.createElement('ul');
            commentsList.classList.add('comment-list');
            comments.forEach(comment => {
                const commentListItem = document.createElement('li');
                commentListItem.classList.add('comment-item');

                const commentContent = document.createElement('p');
                commentContent.textContent = comment.content;
                commentListItem.appendChild(commentContent);

                const commentAuthor = document.createElement('small');
                commentAuthor.textContent = comment.username;
                commentAuthor.style.color = '#009882';
                commentListItem.appendChild(commentAuthor);

                /// Comment upvote Button
                const upvoteButton = document.createElement('button');
                upvoteButton.innerHTML = '<span>&uarr;</span> <span class="upvote-count">' + comment.upvotes + '</span>';
                upvoteButton.classList.add('upvote-button');
                upvoteButton.addEventListener('click', async () => {
                    const updatedvotes = await handleVote(comment.commentID, 'upvote', "comment");
                    upvoteButton.querySelector('.upvote-count').textContent = updatedvotes.upvotes;
                    downvoteButton.querySelector('.downvote-count').textContent = updatedvotes.downvotes;
                });
                commentListItem.appendChild(upvoteButton);

                // Comment downvote Button
                const downvoteButton = document.createElement('button');
                downvoteButton.innerHTML = '<span>&darr;</span> <span class="downvote-count">' + comment.downvotes + '</span>';
                downvoteButton.classList.add('downvote-button');
                downvoteButton.addEventListener('click', async () => {
                    const updatedvotes = await handleVote(comment.commentID, 'downvote', "comment");
                    upvoteButton.querySelector('.upvote-count').textContent = updatedvotes.upvotes;
                    downvoteButton.querySelector('.downvote-count').textContent = updatedvotes.downvotes;
                });
                commentListItem.appendChild(downvoteButton);

                commentsList.appendChild(commentListItem);
            });
            threadContentModal.appendChild(commentsList);
        }

        // Create an input field for adding comments
        const commentInput = document.createElement('input');
        commentInput.setAttribute('type', 'text');
        commentInput.setAttribute('placeholder', 'Add a comment...');
        commentInput.classList.add('comment-input-field');
        //threadContentModal.appendChild(commentInput);

        // Create a button to submit comments
        const commentSubmitButton = document.createElement('button');
        commentSubmitButton.textContent = 'Submit Comment';
        commentSubmitButton.classList.add('submit-comment-button');
        commentSubmitButton.addEventListener('click', async () => {
            const commentContent = commentInput.value.trim();
            if (commentContent !== '') {
                // Call a function to submit the comment
                await submitComment(thread.threadID, commentContent, thread);
                // Clear the input field after submission
                commentInput.value = '';
            } else {
                alert('Please enter a comment before submitting.');
            }
        });
        // CREATE A DIV to append both input field and submit button to it for styling
        const commentDiv = document.createElement('div');
        commentDiv.classList.add('comment-div');
        commentDiv.appendChild(commentInput);
        commentDiv.appendChild(commentSubmitButton);
        threadContentModal.appendChild(commentDiv);

        overlay.appendChild(threadContentModal);
        // Append the modal and overlay to the body
        const feedContainer = document.querySelector('.feedContainer');
        feedContainer.appendChild(overlay);

        // Show the overlay and modal
        overlay.style.display = 'block';
    }

    async function submitComment(threadID, content, thread) {
        let UserIDInt = parseInt(UserID);

        const newComment = {
            threadID: threadID,
            content: content,
            userID: UserIDInt
        }
        try {
            const response = await fetch('/api/comments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newComment),
            });
            if (response.ok) {
                console.log("New comment created successfully");
                document.querySelector('#overlay').remove();
                displayThreadContent(thread)
            } else {
                console.error('Failed to submit comment');
                throw new Error('Network response was not ok');
            }
        } catch (error) {
            console.error('Error submitting comment: ', error)
        }
    }

    // Function to handle upvote or downvote
    async function handleVote(itemID, action, item) {
        let UserIDInt = parseInt(UserID);
        try {
            const response = await fetch('/api/vote', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ itemID: itemID, action: action, userID: UserIDInt, item: item }),
            });

            if (response.ok) {
                const data = await response.json();
                return data
            } else {
                console.error('Failed to update the upvote/downvote');
                return undefined; // or any default value you want to handle the error
            }
        } catch (error) {
            console.error('Error handling the upvote/downvote action:', error);
        }
    }

    async function fetchVotes(threadID) {
        try {
            const response = await fetch(`/api/votes?threadID=${threadID}`);

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            return data; //Return the fetched votes
        } catch (error) {
            console.error('Error fetching comments:', error);
            // TODO: handle error
        }
    }

    // Public method
    return {
        init: init,
    };
})();

export default UserPage;