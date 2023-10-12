package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"real-time-forum/db"
	"real-time-forum/server"
	"time"
)

type AuthResponse struct {
	IsAuthenticated bool `json:"isAuthenticated"`
}

func CheckAuth(w http.ResponseWriter, r *http.Request) {
	isAuthenticated := true

	cookie, err := r.Cookie("session-token")
	if err != nil {
		if err == http.ErrNoCookie {
			// If the session cookie doesn't exist, set isAuthenticated to false
			isAuthenticated = false
		} else {
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}
	}

	if isAuthenticated {
		sessionID := cookie.Value

		// Check the database for the session ID
		var expiresAt time.Time
		err = db.Dbase.QueryRow("SELECT userID, expiresAt FROM Sessions WHERE sessionID = ?", sessionID).Scan(&server.UserID, &expiresAt)
		if err != nil {
			if err == sql.ErrNoRows {
				isAuthenticated = false
			} else {
				http.Error(w, "Internal Server Error", http.StatusInternalServerError)
				return
			}
		}

		// Check if the session has expired
		if time.Now().After(expiresAt) {
			isAuthenticated = false
		}
	}
	response := AuthResponse{
		IsAuthenticated: isAuthenticated,
	}
	// Convert the struct to JSON
	jsonResponse, err := json.Marshal(response)
	if err != nil {
		http.Error(w, "Failed to generate JSON", http.StatusInternalServerError)
		return
	}

	// Set the content type header and write the JSON response
	w.Header().Set("Content-Type", "application/json")
	w.Write(jsonResponse)
}
