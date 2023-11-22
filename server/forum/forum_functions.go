package forum

import (
	"database/sql"
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
	query := "SELECT threadID, title, content, strftime('%Y-%m-%d %H:%M', createdAt, '+3 hours') AS formattedCreatedAt, categoryID, userID FROM Threads WHERE CategoryID = ?"
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
		thread.Username = GetUserByID(thread.UserID)
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
	query := `SELECT commentID, userID, threadID, content, strftime('%Y-%m-%d %H:%M', createdAt, '+3 hours') AS formattedCreatedAt FROM Comments WHERE threadID = ?`
	result, err := db.Dbase.Query(query, threadID)
	if err != nil {
		fmt.Println("Error querying comments for threadID: ", threadID)
		return nil, err
	}
	defer result.Close()
	var comments []Comment
	for result.Next() {
		var comment Comment
		if err := result.Scan(&comment.CommentID, &comment.UserID, &comment.ThreadID, &comment.Content, &comment.CreatedAt); err != nil {
			fmt.Println("Error scanning comments: ", err)
			return nil, err
		}
		comments = append(comments, comment)
	}
	for i, comment := range comments {
		upvotes, downvotes, _ := GetItemVotes("comment", comment.CommentID)
		comments[i].Upvotes = upvotes
		comments[i].Downvotes = downvotes
		comments[i].Username = GetUserByID(comments[i].UserID)
	}
	return comments, nil
}

func CreateComment(threadID, userID int, content string) (int64, error) {
	// Prepare the SQL statement
	query := `
        INSERT INTO Comments (threadID, userID, content)
        VALUES (?, ?, ?)
    `

	// Execute the SQL statement
	result, err := db.Dbase.Exec(query, threadID, userID, content)
	if err != nil {
		return 0, err
	}

	// Retrieve the last inserted ID (commentID)
	lastInsertID, err := result.LastInsertId()
	if err != nil {
		return 0, err
	}

	return lastInsertID, nil
}

// Item is either thread or comment

func VoteItem(itemID, userID int, rating, item string) error {
	// Check if the user has already rated the item
	var ratingDB string
	query := fmt.Sprintf("SELECT type FROM Votes WHERE %sID = ? AND userID = ?", item)
	err := db.Dbase.QueryRow(query, itemID, userID).Scan(&ratingDB)
	if err != nil {
		if err == sql.ErrNoRows {
			_, err = db.Dbase.Exec(fmt.Sprintf("INSERT INTO Votes (%sID, userID, type) VALUES (?, ?, ?)", item), itemID, userID, rating)
			fmt.Println(err)
			return err
		}
		return err
	}
	if rating == ratingDB {
		// If the user has already rated the item with the same rating, remove the rating
		_, err = db.Dbase.Exec(fmt.Sprintf("DELETE FROM Votes WHERE %sID = ? AND userID = ?", item), itemID, userID)
		return err
	}

	// If the user has rated the item differently, update the rating
	_, err = db.Dbase.Exec(fmt.Sprintf("UPDATE Votes SET type = ? WHERE %sID = ? AND userID = ?", item), rating, itemID, userID)
	return err
}

func GetItemVotes(itemType string, itemID int) (int, int, error) {
	likes := 0
	dislikes := 0
	upvoteStr := "upvote"
	downvoteStr := "downvote"

	queryLike := fmt.Sprintf("SELECT COUNT(*) FROM Votes WHERE %sID = ? AND type = ?", itemType)
	queryDislike := fmt.Sprintf("SELECT COUNT(*) FROM Votes WHERE %sID = ? AND type = ?", itemType)
	err := db.Dbase.QueryRow(queryLike, itemID, upvoteStr).Scan(&likes)
	if err != nil {
		return likes, dislikes, err
	}

	err = db.Dbase.QueryRow(queryDislike, itemID, downvoteStr).Scan(&dislikes)
	if err != nil {
		return likes, dislikes, err
	}

	return likes, dislikes, nil
}

func GetUserByID(UserID int) string {
	query := "SELECT username FROM Users WHERE userID = ?"
	var username string
	err := db.Dbase.QueryRow(query, UserID).Scan(&username)
	if err != nil {
		fmt.Println("No user with selected ID")
		return ""
	}
	return username
}
