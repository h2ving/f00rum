package userpage

import "time"

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