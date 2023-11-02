package forum

import (
	"fmt"
	"log"
	"real-time-forum/db"
)

func CreateThread(title, content string, categoryID, userID int) (int, error) {
	// Prepare the SQL statement for inserting a new thread.
    stmt, err := db.Dbase.Prepare("INSERT INTO Threads (title, content, categoryID, userID) VALUES (?, ?, ?, ?)")
    if err != nil {
        log.Println("Error preparing the SQL statement:", err)
        return 0, err
    }
    defer stmt.Close()

    // Execute the SQL statement to insert a new thread and get the last inserted ID.
    result, err := stmt.Exec(title, content, categoryID, userID)
    if err != nil {
        log.Println("Error executing the SQL statement:", err)
        return 0, err
    }

    lastInsertedID, err := result.LastInsertId()
    if err != nil {
        log.Println("Error getting the last inserted ID:", err)
        return 0, err
    }

    return int(lastInsertedID), nil
}

// GetThreadsByCategory retrieves a list of threads within a specific category.
func GetThreadsByCategory(categoryID int) ([]Thread, error) {
    query := "SELECT * FROM Threads WHERE categoryID = ?"
    rows, err := db.Dbase.Query(query, categoryID)
    if err != nil {
        return nil, err
    }
    defer rows.Close()

    var threads []Thread
    for rows.Next() {
        var thread Thread
        if err := rows.Scan(&thread.ThreadID, &thread.Title, &thread.Content, &thread.CategoryID, &thread.UserID); err != nil {
            return nil, err
        }
        threads = append(threads, thread)
    }

    return threads, nil
}

// CreatePost creates a new post within a thread.
func CreatePost(content string, threadID, userID int) (int, error) {
    stmt, err := db.Dbase.Prepare("INSERT INTO Posts (content, threadID, userID) VALUES (?, ?, ?)")
    if err != nil {
        log.Println("Error preparing the SQL statement:", err)
        return 0, err
    }
    defer stmt.Close()

    result, err := stmt.Exec(content, threadID, userID)
    if err != nil {
        log.Println("Error executing the SQL statement:", err)
        return 0, err
    }

    lastInsertedID, err := result.LastInsertId()
    if err != nil {
        log.Println("Error getting the last inserted ID:", err)
        return 0, err
    }

    return int(lastInsertedID), nil
}

// GetPostsInThread retrieves a list of posts within a specific thread.
func GetPostsInThread(threadID int) ([]Post, error) {
    query := "SELECT * FROM Posts WHERE threadID = ?"
    rows, err := db.Dbase.Query(query, threadID)
    if err != nil {
        return nil, err
    }
    defer rows.Close()

    var posts []Post
    for rows.Next() {
        var post Post
        if err := rows.Scan(&post.PostID, &post.Content, &post.ThreadID, &post.UserID); err != nil {
            return nil, err
        }
        posts = append(posts, post)
    }

    return posts, nil
}

// CreateComment creates a new comment on a post.
func CreateComment(content string, postID, userID int) (int, error) {
    stmt, err := db.Dbase.Prepare("INSERT INTO Comments (content, postID, userID) VALUES (?, ?, ?)")
    if err != nil {
        log.Println("Error preparing the SQL statement:", err)
        return 0, err
    }
    defer stmt.Close()

    result, err := stmt.Exec(content, postID, userID)
    if err != nil {
        log.Println("Error executing the SQL statement:", err)
        return 0, err
    }

    lastInsertedID, err := result.LastInsertId()
    if err != nil {
        log.Println("Error getting the last inserted ID:", err)
        return 0, err
    }

    return int(lastInsertedID), nil
}

// GetCommentsOnPost retrieves a list of comments on a specific post.
func GetCommentsOnPost(postID int) ([]Comment, error) {
    query := "SELECT * FROM Comments WHERE postID = ?"
    rows, err := db.Dbase.Query(query, postID)
    if err != nil {
        return nil, err
    }
    defer rows.Close()

    var comments []Comment
    for rows.Next() {
        var comment Comment
        if err := rows.Scan(&comment.CommentID, &comment.Content, &comment.PostID, &comment.UserID); err != nil {
            return nil, err
        }
        comments = append(comments, comment)
    }

    return comments, nil
}

// HandleLikeDislike handles user likes and dislikes on posts or comments.
func HandleLikeDislike(userID, postID, commentID int, likeType string) error {
    var query string
    if postID != 0 {
        query = "INSERT INTO LikesDislikes (userID, postID, commentID, type) VALUES (?, ?, ?, ?)"
    } else if commentID != 0 {
        query = "INSERT INTO LikesDislikes (userID, postID, commentID, type) VALUES (?, ?, ?, ?)"
    } else {
        return fmt.Errorf("Invalid like/dislike target")
    }

    _, err := db.Dbase.Exec(query, userID, postID, commentID, likeType)
    if err != nil {
        log.Println("Error executing the SQL statement:", err)
        return err
    }

    return nil
}

// GetLikesAndDislikesCount retrieves the total likes and dislikes for a post or comment.
func GetLikesAndDislikesCount(postID, commentID int) (int, int, error) {
    var likes, dislikes int

    var query string
    if postID != 0 {
        query = "SELECT COUNT(*) FROM LikesDislikes WHERE postID = ? AND type = 'like'"
        err := db.Dbase.QueryRow(query, postID).Scan(&likes)
        if err != nil {
            return 0, 0, err
        }

        query = "SELECT COUNT(*) FROM LikesDislikes WHERE postID = ? AND type = 'dislike'"
        err = db.Dbase.QueryRow(query, postID).Scan(&dislikes)
        if err != nil {
            return 0, 0, err
        }
    } else if commentID != 0 {
        query = "SELECT COUNT(*) FROM LikesDislikes WHERE commentID = ? AND type = 'like'"
        err := db.Dbase.QueryRow(query, commentID).Scan(&likes)
        if err != nil {
            return 0, 0, err
        }

        query = "SELECT COUNT(*) FROM LikesDislikes WHERE commentID = ? AND type = 'dislike'"
        err = db.Dbase.QueryRow(query, commentID).Scan(&dislikes)
        if err != nil {
            return 0, 0, err
        }
    }

    return likes, dislikes, nil
}

// GetCategories retrieves a list of categories.
func GetCategories() ([]Category, error) {
    query := "SELECT * FROM Categories"
    rows, err := db.Dbase.Query(query)
    if err != nil {
        return nil, err
    }
    defer rows.Close()

    var categories []Category
    for rows.Next() {
        var category Category
        if err := rows.Scan(&category.CategoryID, &category.Title, &category.Description, &category.CreatedAt); err != nil {
            return nil, err
        }
        categories = append(categories, category)
    }

    return categories, nil
}
