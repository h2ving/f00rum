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
