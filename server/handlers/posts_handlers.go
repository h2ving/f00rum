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
		Title      string `json:"title"`
		Content    string `json:"content"`
		CategoryID int    `json:"categoryID"`
		UserID     int    `json:"userID"`
	}
	// Decode the incoming JSON request
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

	// If successful, create a response
	response := map[string]interface{}{
		"message": "Thread created successfully",
		"data":    threadID,
	}

	// Send the response
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func GetCommentsHandler(w http.ResponseWriter, r *http.Request) {
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
		Item   string `json:"item"`
		ItemID int    `json:"itemID"`
		Action string `json:"action"`
		UserID int    `json:"userID"`
	}

	if err := json.NewDecoder(r.Body).Decode(&voteData); err != nil {
		http.Error(w, "Failed to parse request data", http.StatusBadRequest)
		return
	}
	forum.VoteItem(voteData.ItemID, voteData.UserID, voteData.Action, voteData.Item)
	upvotes, downvotes, _ := forum.GetItemVotes(voteData.Item, voteData.ItemID)
	// Create a response struct for the votes
	response := struct {
		Upvotes   int `json:"upvotes"`
		Downvotes int `json:"downvotes"`
	}{
		Upvotes:   upvotes,
		Downvotes: downvotes,
	}

	responseData, err := json.Marshal(response)
	if err != nil {
		http.Error(w, "Failed to marshal response data", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_, err = w.Write(responseData)
	if err != nil {
		// Handle error writing response here
		return
	}

}

func GetVotesHandler(w http.ResponseWriter, r *http.Request) {
	threadID := r.URL.Query().Get("threadID")
	threadIDInt, err := strconv.Atoi(threadID)
	if err != nil {
		fmt.Println("Error converting threadID to int", http.StatusInternalServerError)
	}
	upvotes, downvotes, err := forum.GetItemVotes("thread", threadIDInt)
	if err != nil {
		fmt.Println("Failed to fetch votes", http.StatusInternalServerError)
	}
	response := struct {
		Upvotes   int `json:"upvotes"`
		Downvotes int `json:"downvotes"`
	}{
		Upvotes:   upvotes,
		Downvotes: downvotes,
	}

	responseData, err := json.Marshal(response)
	if err != nil {
		http.Error(w, "Failed to marshal response data", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_, err = w.Write(responseData)
	if err != nil {
		// Handle error writing response here
		return
	}
}
