package userpage

import (
	"fmt"
	"real-time-forum/db"
	"real-time-forum/server/forum"
)

func GetThreadsByUsername(username string) ([]forum.Thread, error) {
	var threads []forum.Thread

	// Fetch threads based on the provided username
	query := `
		SELECT t.threadID, t.title,  strftime('%Y-%m-%d %H:%M', t.createdAt, '+3 hours') AS formattedCreatedAt,t.content, t.categoryID, t.userID
		FROM Threads t
		JOIN Users u ON t.userID = u.userID
		WHERE u.username = ?
	`

	rows, err := db.Dbase.Query(query, username)
	if err != nil {
		fmt.Println("Error querying threads by username: ", username+" with error: ", err)
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var thread forum.Thread
		if err := rows.Scan(&thread.ThreadID, &thread.Title, &thread.CreatedAt, &thread.Content, &thread.CategoryID, &thread.UserID); err != nil {
			return nil, err
		}
		threads = append(threads, thread)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}
	return threads, nil
}

// GetUserUpvotedThreads retrieves threads upvoted by a specific user
func GetUserUpvotedThreads(username string) ([]forum.Thread, error) {
	var upvotedThreads []forum.Thread

	// Fetch upvoted threads based on the provided username
	query := `
		SELECT t.threadID, t.title,  strftime('%Y-%m-%d %H:%M', t.createdAt, '+3 hours') AS formattedCreatedAt, t.content, t.categoryID, t.userID
		FROM Threads t
		INNER JOIN Votes v ON t.threadID = v.threadID
		INNER JOIN Users u ON v.userID = u.userID
		WHERE u.username = ? AND v.type = 'upvote'
	`

	rows, err := db.Dbase.Query(query, username)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var thread forum.Thread
		if err := rows.Scan(&thread.ThreadID, &thread.Title, &thread.CreatedAt, &thread.Content, &thread.CategoryID, &thread.UserID); err != nil {
			return nil, err
		}
		upvotedThreads = append(upvotedThreads, thread)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return upvotedThreads, nil
}
