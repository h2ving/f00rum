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
    Upvotes        int `json:"upvotes"`
    Downvotes     int `json:"downvotes"`
}

type Comment struct {
    CommentID int       `json:"commentID"`
    UserID    int       `json:"userID"`
    ThreadID  int       `json:"threadID"`
    Content   string    `json:"content"`
    CreatedAt time.Time `json:"createdAt"`
    Upvotes     int       `json:"upvotes"`
    Downvotes  int       `json:"downvotes"`
}

type Vote struct {
    VoteID    int    `json:"voteID"`
    Type      string `json:"type"` // 'like' or 'dislike'
    UserID    int `json:"userID"`
    ThreadID  int `json:"threadID"`
    CommentID int `json:"commentID"`
}
