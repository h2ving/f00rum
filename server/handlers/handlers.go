package handlers

import (
	"database/sql"
	"encoding/json"
	"html/template"
	"net/http"
	"real-time-forum/db"
	"time"
)

type AuthResponse struct {
	IsAuthenticated bool `json:"isAuthenticated"`
}

func HandleIndex(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/" && r.URL.Path != "/forum" {
		http.Error(w, "ErrorIndex3", http.StatusInternalServerError)
		return
	}
	tmpl, err := template.ParseFiles("./web/static/index.html")
	if err != nil {
		http.Error(w, "Internal Server Error1", http.StatusInternalServerError)
		return
	}

	err = tmpl.Execute(w, nil)
	if err != nil {
		http.Error(w, "Internal Server Error2", http.StatusInternalServerError)
	}

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
		err = db.Dbase.QueryRow("SELECT expiresAt FROM Sessions WHERE sessionID = ?", sessionID).Scan(&expiresAt)
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
