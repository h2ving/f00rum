package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"real-time-forum/server/forum"
	"strconv"
)

func GetCategoriesHandler(w http.ResponseWriter, r *http.Request) {
	categories, err := forum.GetCategories()
	if err != nil {
		fmt.Println("Failed to get categories from server: ", err)
		return
	}

	response, err := json.Marshal(categories)
	if err != nil {
		http.Error(w, "Failed to fetch categories /posts_handlers.go/, ", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write(response)
}

func GetThreadsByCategoryHandler(w http.ResponseWriter, r *http.Request) {
	categoryID := r.URL.Query().Get("categoryID")
	threads, err := forum.GetThreadsByCategoryID(categoryID)
	if err != nil {
		fmt.Println(err)
		http.Error(w, "Failed to get threads from server: ", http.StatusInternalServerError)
		return
	}
	
	response, _ := json.Marshal(threads)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write(response)
}

func CreateThreadsHandler(w http.ResponseWriter, r *http.Request) {
	var request struct {
		Title   	string 	`json:"title"`
		Content 	string 	`json:"content"`
		CategoryID  int 	`json:"categoryID"`
		UserID 		int 	`json:"userID"`
	}
	fmt.Println()
	// Decode the incoming JSON request
    err := json.NewDecoder(r.Body).Decode(&request)
    if err != nil {
        http.Error(w, "Failed to parse request data", http.StatusBadRequest)
        return
    }
	fmt.Println(request.CategoryID, request.Title, request.Content, request.UserID)

	threadID, err := forum.CreateThread(request.Title, request.Content,request.CategoryID, request.UserID)
    if err != nil {
        http.Error(w, "Failed to create the thread", http.StatusInternalServerError)
        return
    }

	// If successful, create a response
    response := map[string]interface{}{
        "message": "Thread created successfully",
        "data":    threadID,
    }

    // Send the response
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(response)
}

func GetComments(w http.ResponseWriter, r *http.Request) {
	threadID := r.URL.Query().Get("threadID")
	threadIDInt, err := strconv.Atoi(threadID)
	if err != nil {
		http.Error(w, "Couldn't convert threadID to int", http.StatusInternalServerError)
		return
	}

	comments, err := forum.GetComments(threadIDInt)
	if err != nil {
		http.Error(w, "Failed to fetch comments", http.StatusInternalServerError)
		return
	}

	response, err := json.Marshal(comments)
	if err != nil {
		http.Error(w, "Failed to serialize comments", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write(response)
}

func VoteHandler(w http.ResponseWriter, r *http.Request) {
    if r.Method != http.MethodPost {
        http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
        return
    }

    var voteData struct {
        CommentID int    `json:"commentID"`
        Action    string `json:"action"`
        UserID    int    `json:"userID"`
    }

    if err := json.NewDecoder(r.Body).Decode(&voteData); err != nil {
        http.Error(w, "Failed to parse request data", http.StatusBadRequest)
        return
    }

    var upvoteCount, downvoteCount int // Initialize variables with zero values
    var err error
    switch voteData.Action {
    case "upvote":
        upvoteCount, err = forum.Upvote(voteData.CommentID, voteData.UserID)
    case "downvote":
        downvoteCount, err = forum.Downvote(voteData.CommentID, voteData.UserID)
    default:
        http.Error(w, "Invalid action provided", http.StatusBadRequest)
        return
    }

    if err != nil {
        http.Error(w, "Failed to update vote", http.StatusInternalServerError)
        return
    }

    response := map[string]interface{}{
        "Upvotes": upvoteCount,
		"Downvotes": downvoteCount,
    }

    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(http.StatusOK)
    if err := json.NewEncoder(w).Encode(response); err != nil {
        http.Error(w, "Failed to encode response", http.StatusInternalServerError)
        return
    }
}

func GetVotesHandler(w http.ResponseWriter, r *http.Request) {
	threadID := r.URL.Query().Get("threadID")
	threadIDInt, err := strconv.Atoi(threadID);
	if err != nil {
		fmt.Println("Error converting threadID to int", http.StatusInternalServerError)
	}
	votes, err := forum.GetCommentVotes(threadIDInt)
	if err != nil {
		fmt.Println("Failed to fetch votes", http.StatusInternalServerError)
	}
	
	response, err := json.Marshal(votes)
	if err != nil {
		http.Error(w, "Failed to serialize comments", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write(response)
}