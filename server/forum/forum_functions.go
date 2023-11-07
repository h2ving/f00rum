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
		if err := result.Scan(&comment.CommentID, &comment.UserID, &comment.ThreadID, &comment.Content, &comment.CreatedAt, &comment.Likes, &comment.Dislikes); err != nil {
			fmt.Println("Error scanning comments: ", err)
			return nil, err
		}
		comments = append(comments, comment)
	}
	return comments, nil
}
