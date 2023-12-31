import { UserID } from './chatbox.js';

const ForumFeed = (function () {
    let stateCategorySelector = false;
    // Load the forum content
    function init() {
        const container = document.querySelector('.feedContainer');
        container.innerHTML = `
        <div id="forum" class="forum-container">
            <div id="categories">
                <!-- Dynamically populated list of categories will appear here -->
            </div>
            <button id="create-thread-button">Create New Thread</button>
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

        const submitModalButton = document.getElementById('submitModalButton');

        categoriesDiv.addEventListener('click', (event) => {
            document.querySelectorAll('#categories div').forEach(div => {
                div.classList.remove('selected-category')
            })
            if (event.target.tagName === 'DIV') {
                const categoryID = event.target.dataset.categoryID;
                event.target.classList.add('selected-category');
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
        let categoryID = document.getElementById('modalCategory').value;
        categoryID = parseInt(categoryID);
        let UserIDInt = parseInt(UserID)

        const newThread = {
            title: title,
            content: content,
            categoryID: categoryID,
            userID: UserIDInt,
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
                console.log('Error response:', error.response);
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
            await displayThreads(data, 'threads');
        } catch (error) {
            console.error('Error fetching threads:', error);
            // Handle the error - you might want to show an error message on the page
        }
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

    function displayCategories(categories) {
        const categoriesDiv = document.getElementById('categories');

        categories.forEach(category => {
            const categoryElement = document.createElement('div');
            categoryElement.textContent = category.title;
            categoryElement.dataset.categoryID = category.categoryID;

            categoriesDiv.appendChild(categoryElement);
        })
    }

    async function displayThreads(threads, element) {
        const threadsDiv = document.getElementById(element);

        for (const thread of threads) {
            const threadElement = document.createElement('div');
            threadElement.classList.add('thread');

            const titleElement = document.createElement('h3');
            titleElement.textContent = thread.title;
            threadElement.appendChild(titleElement);

            // Author
            const threadAuthor = document.createElement('p');
            threadAuthor.textContent = thread.username;
            threadAuthor.style.color = '#009882';
            threadElement.appendChild(threadAuthor);

            // Created At / DATE
            const threadCreatedAt = document.createElement('small');
            threadCreatedAt.textContent = thread.createdAt;
            threadCreatedAt.style.color = '#009888';
            threadElement.appendChild(threadCreatedAt);

            const contentElement = document.createElement('p');
            contentElement.textContent = thread.content;
            threadElement.appendChild(contentElement);

            // Fetch votes for each thread
            const threadvotes = await fetchVotes(thread.threadID)
            /// Thread upvote Button
            const threadupvoteButton = document.createElement('button');
            threadupvoteButton.innerHTML = '<span>&uarr;</span> <span class="upvote-count">' + threadvotes.upvotes + '</span>';
            threadupvoteButton.classList.add('thread-upvote-button');
            threadupvoteButton.addEventListener('click', async (event) => {
                event.stopPropagation();
                const updatedvotes = await handleVote(thread.threadID, 'upvote', "thread");
                threadupvoteButton.querySelector('.upvote-count').textContent = updatedvotes.upvotes;
                threaddownvoteButton.querySelector('.downvote-count').textContent = updatedvotes.downvotes;
            });
            // Thread downvote Button
            const threaddownvoteButton = document.createElement('button');
            threaddownvoteButton.innerHTML = '<span>&darr;</span> <span class="downvote-count">' + threadvotes.downvotes + '</span>';
            threaddownvoteButton.classList.add('thread-downvote-button');
            threaddownvoteButton.addEventListener('click', async (event) => {
                event.stopPropagation();
                const updatedvotes = await handleVote(thread.threadID, 'downvote', "thread");
                threadupvoteButton.querySelector('.upvote-count').textContent = updatedvotes.upvotes;
                threaddownvoteButton.querySelector('.downvote-count').textContent = updatedvotes.downvotes;
            });

            // Append elements to the thread container
            threadElement.appendChild(threadupvoteButton);
            threadElement.appendChild(threaddownvoteButton);
            threadsDiv.appendChild(threadElement);

            // Add event listener for when a thread is clicked
            threadElement.addEventListener('click', async () => {
                await displayThreadContent(thread);
            });
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

        // Created At / DATE
        const threadCreatedAt = document.createElement('span');
        threadCreatedAt.textContent = thread.createdAt;
        threadCreatedAt.style.color = '#009888';
        originalThreadContent.appendChild(threadCreatedAt);

        // Content
        const contentElement = document.createElement('p');
        contentElement.textContent = thread.content;
        originalThreadContent.appendChild(contentElement);

        const threadvotes = await fetchVotes(thread.threadID)
        /// Thread upvote Button
        const threadupvoteButton = document.createElement('button');
        threadupvoteButton.innerHTML = '<span>&uarr;</span> <span class="upvote-count">' + threadvotes.upvotes + '</span>';
        threadupvoteButton.classList.add('upvote-button');
        threadupvoteButton.addEventListener('click', async () => {
            const updatedvotes = await handleVote(thread.threadID, 'upvote', "thread");
            threadupvoteButton.querySelector('.upvote-count').textContent = updatedvotes.upvotes;
            threaddownvoteButton.querySelector('.downvote-count').textContent = updatedvotes.downvotes;
        });
        originalThreadContent.appendChild(threadupvoteButton);

        // Thread downvote Button
        const threaddownvoteButton = document.createElement('button');
        threaddownvoteButton.innerHTML = '<span>&darr;</span> <span class="downvote-count">' + threadvotes.downvotes + '</span>';
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

                //DATE
                const commentDate = document.createElement('span');
                commentDate.textContent = comment.createdAt;
                commentDate.style.color = '#002121';
                commentListItem.appendChild(commentDate);


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


    //Public methods
    return {
        init: init,
        displayThreads: displayThreads,
    };
})();

export default ForumFeed;