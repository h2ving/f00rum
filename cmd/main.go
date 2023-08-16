package cmd

import (
	"net/http"
	"real-time-forum/db"
	chat "real-time-forum/server/chat"
)

var (
	Sessions = make(map[string]int)
	SecretKey = []byte("secret")
)

func main() {
	db.StartDB()
	hub := chat.NewHub()
	go hub.Run()
	//http.HandleFunc("/", ServeLoginIfNotAuthed)
	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		chat.ServeWs(hub, w, r)
	})
}