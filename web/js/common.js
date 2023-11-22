export async function fetchVotes(itemId) {
    try {
        const response = await fetch(`/api/votes?itemID=${itemId}`);

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching votes:', error);
        return null;
    }
}

export async function handleVote(itemId, action, item) {
    try {
        const UserIDInt = parseInt(UserID);

        const response = await fetch('/api/vote', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ itemID: itemId, action, userID: UserIDInt, item }),
        });

        if (response.ok) {
            return await response.json();
        } else {
            console.error('Failed to update the vote');
            return null;
        }
    } catch (error) {
        console.error('Error handling the vote:', error);
        return null;
    }
}

export async function fetchComments(itemId) {
    try {
        const response = await fetch(`/api/comments?itemID=${itemId}`);

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching comments:', error);
        return null;
    }
}
