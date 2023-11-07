package forum

import "time"

type Category struct {
	CategoryID int `json:"categoryID"`
	Title string `json:"title"`
	Description string `json:"description"`
	CreatedAt time.Time `json:"createdAt"`
}

type Thread struct {
    ThreadID     int    `json:"threadID"`
    Title        string `json:"title"`
    Content      string `json:"content"`
    CreatedAt    time.Time `json:"createdAt"`
    CategoryID   int `json:"categoryID"`
    UserID       int `json:"userID"`
    Likes        int `json:"likes"`
    Dislikes     int `json:"dislikes"`
}

type Post struct {
    PostID       int    `json:"postID"`
    Content      string `json:"content"`
    CreatedAt    time.Time `json:"createdAt"`
    UserID       int `json:"userID"`
    ThreadID     int `json:"threadID"`
    Likes        int `json:"likes"`
    Dislikes     int `json:"dislikes"`
}

type Comment struct {
    CommentID int       `json:"commentID"`
    UserID    int       `json:"userID"`
    ThreadID  int       `json:"threadID"`
    Content   string    `json:"content"`
    CreatedAt time.Time `json:"createdAt"`
    Likes     int       `json:"likes"`
    Dislikes  int       `json:"dislikes"`
}

type LikeDislike struct {
    LikeDislikeID int    `json:"likeDislikeID"`
    Type           string `json:"type"` // 'like' or 'dislike'
    UserID         int `json:"userID"`
    PostID         int `json:"postID"`
    CommentID      int `json:"commentID"`
}
