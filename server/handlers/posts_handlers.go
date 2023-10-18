package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"real-time-forum/server/forum"
	"strconv"
)

// CreateThreadHandler handles the creation of a new thread.
func CreateThreadHandler(w http.ResponseWriter, r *http.Request) {
	var request struct {
		Title      string `json:"title"`
		Content    string `json:"content"`
		CategoryID int    `json:"categoryID"`
		UserID     int    `json:"userID"`
	}

	err := json.NewDecoder(r.Body).Decode(&request)
	if err != nil {
		http.Error(w, "Failed to parse request data", http.StatusBadRequest)
		return
	}

	threadID, err := forum.CreateThread(request.Title, request.Content, request.CategoryID, request.UserID)
	if err != nil {
		http.Error(w, "Failed to create the thread", http.StatusInternalServerError)
		return
	}

	response := map[string]interface{}{
		"message": "Thread created successfully",
		"data":    threadID,
	}
	json.NewEncoder(w).Encode(response)
}

// CreatePostHandler handles the creation of a new post.
func CreatePostHandler(w http.ResponseWriter, r *http.Request) {
	var request struct {
		Content  string `json:"content"`
		ThreadID int    `json:"threadID"`
		UserID   int    `json:"userID"`
	}

	err := json.NewDecoder(r.Body).Decode(&request)
	if err != nil {
		http.Error(w, "Failed to parse request data", http.StatusBadRequest)
		return
	}

	postID, err := forum.CreatePost(request.Content, request.ThreadID, request.UserID)
	if err != nil {
		http.Error(w, "Failed to create the post", http.StatusInternalServerError)
		return
	}

	response := map[string]interface{}{
		"message": "Post created successfully",
		"data":    postID,
	}
	json.NewEncoder(w).Encode(response)
}

// CreateCommentHandler handles the creation of a new comment on a post.
func CreateCommentHandler(w http.ResponseWriter, r *http.Request) {
	var request struct {
		Content string `json:"content"`
		PostID  int    `json:"postID"`
		UserID  int    `json:"userID"`
	}

	err := json.NewDecoder(r.Body).Decode(&request)
	if err != nil {
		http.Error(w, "Failed to parse request data", http.StatusBadRequest)
		return
	}

	commentID, err := forum.CreateComment(request.Content, request.PostID, request.UserID)
	if err != nil {
		http.Error(w, "Failed to create the comment", http.StatusInternalServerError)
		return
	}

	response := map[string]interface{}{
		"message": "Comment created successfully",
		"data":    commentID,
	}
	json.NewEncoder(w).Encode(response)
}

// LikeDislikeHandler handles user likes and dislikes on posts or comments.
func LikeDislikeHandler(w http.ResponseWriter, r *http.Request) {
	var request struct {
		UserID    int    `json:"userID"`
		PostID    int    `json:"postID"`
		CommentID int    `json:"commentID"`
		LikeType  string `json:"likeType"`
	}

	err := json.NewDecoder(r.Body).Decode(&request)
	if err != nil {
		http.Error(w, "Failed to parse request data", http.StatusBadRequest)
		return
	}

	err = forum.HandleLikeDislike(request.UserID, request.PostID, request.CommentID, request.LikeType)
	if err != nil {
		http.Error(w, "Failed to handle the like/dislike", http.StatusInternalServerError)
		return
	}

	response := map[string]interface{}{
		"message": "Like/Dislike handled successfully",
		"data":    nil,
	}
	json.NewEncoder(w).Encode(response)
}

// GetThreadsHandler handles the retrieval of thread data.
func GetThreadsHandler(w http.ResponseWriter, r *http.Request) {
	// Parse query parameters
	categoryIDinString := r.URL.Query().Get("categoryID")
	categoryID, err := strconv.Atoi(categoryIDinString)
	if err != nil {
		fmt.Println("Error parsing categoryID to int", err)
		http.Error(w, "Invalid categoryID", http.StatusInternalServerError)
		return
	}

	// Call the GetThreadsByCategory function from your forum package.
	threads, err := forum.GetThreadsByCategory(categoryID) // Pass the category ID as needed.
	if err != nil {
		// Handle the error and send an error response to the client.
		http.Error(w, "Failed to fetch threads", http.StatusInternalServerError)
		return
	}

	// Serialize the threads to JSON and send it as a response.
	response, _ := json.Marshal(threads)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write(response)
}

// GetPostsHandler handles the retrieval of post data.
func GetPostsHandler(w http.ResponseWriter, r *http.Request) {
	// Parse query parameters
	threadIDString := r.URL.Query().Get("threadID")
	threadID, err := strconv.Atoi(threadIDString)
	if err != nil {
		fmt.Println("Error parsing threadID to int")
		http.Error(w, "Invalid threadID", http.StatusInternalServerError)
		return
	}

	// Call the GetPostsInThread function from your forum package.
	posts, err := forum.GetPostsInThread(threadID) // Pass the thread ID as needed.
	if err != nil {
		// Handle the error and send an error response to the client.
		http.Error(w, "Failed to fetch posts", http.StatusInternalServerError)
		return
	}

	// Serialize the posts to JSON and send it as a response.
	response, _ := json.Marshal(posts)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write(response)
}

func GetCategoriesHandler(w http.ResponseWriter, r *http.Request) {
	categories, err := forum.GetCategories()
	if err != nil {
		fmt.Println("Failed to get categories")
		return
	}

	response, err := json.Marshal(categories)
	if err != nil {
        http.Error(w, "Failed to fetch categories", http.StatusInternalServerError)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(http.StatusOK)
    w.Write(response)
}
