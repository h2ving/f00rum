package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"real-time-forum/server/forum"
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