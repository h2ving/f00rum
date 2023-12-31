package main

import (
	"fmt"
	"github.com/gorilla/mux"
	"net/http"
	"real-time-forum/db"
	"real-time-forum/server/chat"
	"real-time-forum/server/handlers"
)

func main() {
	db.StartDB()
	mux := mux.NewRouter()

	// Serve static files
	for _, dir := range []string{"static", "js"} {
		path := "/" + dir + "/"
		mux.PathPrefix(path).Handler(http.StripPrefix(path, http.FileServer(http.Dir("web/"+dir))))
	}

	hub := chat.NewHub()
	mux.HandleFunc("/register", handlers.HandleRegistration).Methods("POST")
	mux.HandleFunc("/check-auth", handlers.CheckAuth)
	mux.HandleFunc("/login", handlers.HandleLogin).Methods("POST")
	mux.HandleFunc("/logout", handlers.HandleLogout).Methods("POST")
	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		chat.ServeWs(hub, w, r)
	})

	// endpoints for forum part
	mux.HandleFunc("/api/categories", handlers.GetCategoriesHandler).Methods("GET")
	mux.HandleFunc("/api/threads", handlers.GetThreadsByCategoryHandler).Methods("GET")
	mux.HandleFunc("/api/threads", handlers.CreateThreadsHandler).Methods("POST")
	mux.HandleFunc("/api/comments", handlers.GetCommentsHandler).Methods("GET")
	mux.HandleFunc("/api/comments", handlers.CreateCommentHandler).Methods("POST")
	mux.HandleFunc("/api/vote", handlers.VoteHandler).Methods("POST")
	mux.HandleFunc("/api/votes", handlers.GetVotesHandler).Methods("GET")

	// endpoints for user page
	mux.HandleFunc("/api/user", handlers.GetUserThreadsHandler).Methods("GET")
	mux.HandleFunc("/api/uservotes", handlers.GetUserUpvotesHandler).Methods("GET")

	// Catch-all route to serve index.html for all other routes
	mux.PathPrefix("/").HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "./web/static/index.html")
	})
	http.Handle("/", mux)
	go hub.Run()

	fmt.Println("Server listening on port 8080")
	http.ListenAndServe(":8080", nil)
}
