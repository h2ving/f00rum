package handlers

import (
	"encoding/json"
	"fmt"
	"golang.org/x/crypto/bcrypt"
	"net/http"
	"real-time-forum/db"
	"real-time-forum/server"
	"real-time-forum/server/functions"
	"time"
)

func HandleLogin(w http.ResponseWriter, r *http.Request) {
	// Parse form data
	var logData server.LoginData
	decoder := json.NewDecoder(r.Body)
	err := decoder.Decode(&logData)
	if err != nil {
		http.Error(w, "Error parsing JSON: "+err.Error(), http.StatusBadRequest)
		return
	}

	user, err := functions.GetUserByEmailOrNickname(db.Dbase, logData.Username)
	if err != nil {
		// Handle error
		fmt.Printf("Error getting user by email or nickname: %v <> error: %v \n", logData.Username, err)
		return
	}

	if user.UserID == 0 {
		// User not found
		// Handle invalid credentials
		return
	}
	// Compare hashed password with provided password
	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(logData.Password))
	if err != nil {
		fmt.Println("Error comparing password: ", err)
		return
	}
	// Generate a session token
	sessionToken := functions.GenerateSessionToken()
	// Store the session in the database with an expiration time

	functions.StoreSessionInDB(db.Dbase, sessionToken, user.UserID)
	// Set a cookie with the session token
	http.SetCookie(w, &http.Cookie{
		Name:   "session-token",
		Value:  sessionToken,
		MaxAge: 60 * 15, // 15 minutes
	})

	// Send a success response
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Login successful",
	})
}

func HandleLogout(w http.ResponseWriter, r *http.Request) {
	// Retrieve the session-token cookie
	_, err := r.Cookie("session-token")
	if err != nil {
		if err == http.ErrNoCookie {
			// If the session cookie doesn't exist, the user is already logged out
			http.Error(w, "User already logged out", http.StatusBadRequest)
			return
		}
		// For any other error, return a bad request status
		http.Error(w, "Bad request", http.StatusBadRequest)
		return
	}

	// Delete the session-token cookie
	http.SetCookie(w, &http.Cookie{
		Name:    "session-token",
		Value:   "",
		MaxAge:  -1, // Setting MaxAge to -1 immediately expires the cookie
		Expires: time.Unix(0, 0),
	})

	// Send a success response
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Logout successful",
	})
}
