package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"real-time-forum/server/userpage"
)

func GetUserThreadsHandler(w http.ResponseWriter, r *http.Request) {
	username := r.URL.Query().Get("username")
	threads, err := userpage.GetThreadsByUsername(username)
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

func GetUserUpvotesHandler(w http.ResponseWriter, r *http.Request) {
	username := r.URL.Query().Get("username")
	threads, err := userpage.GetUserUpvotedThreads(username)
	if err != nil {
		fmt.Println(err)
		http.Error(w, "Failed to get upvoted threads from server: ", http.StatusInternalServerError)
		return
	}
	response, _ := json.Marshal(threads)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write(response)
}