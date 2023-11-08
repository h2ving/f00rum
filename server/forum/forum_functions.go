package forum

import (
	"fmt"
	"real-time-forum/db"
)

func GetCategories() ([]Category, error) {
	query := "SELECT * FROM Categories"
	rows, err := db.Dbase.Query(query)
	if err != nil {
		fmt.Println("Error querying categories: ", err)
		return nil, err
	}
	defer rows.Close()

	var categories []Category
	for rows.Next() {
		var category Category
		if err := rows.Scan(&category.CategoryID, &category.Title, &category.Description, &category.CreatedAt); err != nil {
			fmt.Println("Error scanning categories: ", err)
			return nil, err
		}
		categories = append(categories, category)
	}
	return categories, nil
}

func GetThreadsByCategoryID(categoryID string) ([]Thread, error) {
	query := "SELECT * FROM Threads WHERE CategoryID = ?"
	rows, err := db.Dbase.Query(query, categoryID)
	if err != nil {
		fmt.Println("Error querying threads: ", err)
		return nil, err
	}
	defer rows.Close()

	var threads []Thread
	for rows.Next() {
		var thread Thread
		if err := rows.Scan(&thread.ThreadID, &thread.Title, &thread.Content, &thread.CreatedAt, &thread.CategoryID, &thread.UserID); err != nil {
			fmt.Println("Error scanning threads: ", err)
			return nil, err
		}
		threads = append(threads, thread)
	}
	return threads, nil
}

func CreateThread(title, content string, categoryID, userID int) (int64, error) {
	// Prepare the SQL statement
	query := `
        INSERT INTO Threads (title, content, categoryID, userID)
        VALUES (?, ?, ?, ?)
    `

	// Execute the SQL statement
	result, err := db.Dbase.Exec(query, title, content, categoryID, userID)
	if err != nil {
		return 0, err
	}

	// Retrieve the last inserted ID (threadID)
	lastInsertID, err := result.LastInsertId()
	if err != nil {
		return 0, err
	}

	return lastInsertID, nil
}

func GetComments(threadID int) ([]Comment, error) {
	query := `SELECT * FROM Comments WHERE threadID = ?`
	result, err := db.Dbase.Query(query, threadID)
	if err != nil {
		fmt.Println("Error querying comments for threadID: ", threadID)
		return nil, err
	}
	defer result.Close()
	var comments []Comment
	for result.Next() {
		var comment Comment
		if err := result.Scan(&comment.CommentID, &comment.UserID, &comment.ThreadID, &comment.Content, &comment.CreatedAt, &comment.Upvotes, &comment.Downvotes); err != nil {
			fmt.Println("Error scanning comments: ", err)
			return nil, err
		}
		comments = append(comments, comment)
	}
	return comments, nil
}

func Upvote(commentID, userID int) (int, error) {
	// Update the comment Likes count
	query := `UPDATE Comments SET upvotes = upvotes + 1 WHERE commentID = ?`
	_, err := db.Dbase.Exec(query, commentID)
	if err != nil {
		fmt.Println("Error upvoting comment: ", err)
		return 0, err
	}

	// Insert the upvote action in LikesDislikes table
	query = `INSERT INTO Votes (type, userID, commentID) VALUES (?, ?, ?)`
	_, err = db.Dbase.Exec(query, "upvote", userID, commentID)
	if err != nil {
		fmt.Println("Error recording upvote action: ", err)
		return 0, err
	}
	// Retrieve the updated like count
	var updatedLikes int
	err = db.Dbase.QueryRow("SELECT upvotes FROM Comments WHERE commentID = ?", commentID).Scan(&updatedLikes)
	if err != nil {
		fmt.Println("Error retrieving updated likes: ", err)
		return 0, err
	}

	return updatedLikes, nil
}
func Downvote(commentID, userID int) (int, error) {
	// Update the comment downvotes count
	query := `UPDATE Comments SET downvotes = downvotes + 1 WHERE commentID = ?`
	_, err := db.Dbase.Exec(query, commentID)
	if err != nil {
		fmt.Println("Error downvoting comment: ", err)
		return 0, err
	}

	// Insert the downvote action in LikesDislikes table
	query = `INSERT INTO Votes (type, userID, commentID) VALUES (?, ?, ?)`
	_, err = db.Dbase.Exec(query, "downvote", userID, commentID)
	if err != nil {
		fmt.Println("Error recording downvote action: ", err)
		return 0, err
	}
	// Retrieve the updated dislike count
	var updatedDislikes int
	err = db.Dbase.QueryRow("SELECT downvotes FROM Comments WHERE commentID = ?", commentID).Scan(&updatedDislikes)
	if err != nil {
		fmt.Println("Error retrieving updated dislikes: ", err)
		return 0, err
	}

	return updatedDislikes, nil
}

// GetVotes retrieves all votes related to a specific threadID through comments
func GetCommentVotes(threadID int) ([]Vote, error) {
    query := `SELECT l.voteID, l.type, l.userID, l.threadID, l.commentID 
              FROM Votes l
              INNER JOIN Comments c ON l.commentID = c.commentID 
              WHERE c.threadID = ?`

    rows, err := db.Dbase.Query(query, threadID)
    if err != nil {
        fmt.Println("Error querying votes: ", err)
        return nil, err
    }
    defer rows.Close()

    var votes []Vote
    for rows.Next() {
        var vote Vote
        if err := rows.Scan(&vote.VoteID, &vote.Type, &vote.UserID, &vote.ThreadID, &vote.CommentID); err != nil {
            fmt.Println("Error scanning votes: ", err)
            return nil, err
        }
        votes = append(votes, vote)
    }
    return votes, nil
}