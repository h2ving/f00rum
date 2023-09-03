package handlers

import (
	"fmt"
	"golang.org/x/crypto/bcrypt"
	"log"
	"net/http"
	"real-time-forum/db"
	"real-time-forum/server/functions"
)

func HandleLogin(w http.ResponseWriter, r *http.Request) {
	// Parse form data
	err := r.ParseForm()
	if err != nil {
		log.Fatalf("Error parsing form data: %v", err)
		return
	}

	// Retrieve user by email or nickname
	emailOrNickname := r.FormValue("email_or_nickname")
	user, err := functions.GetUserByEmailOrNickname(db.Dbase, emailOrNickname)
	if err != nil {
		// Handle error
		fmt.Printf("Error getting user by email or nickname: %v <> error: %v \n", emailOrNickname, err)
		return
	}

	if user.UserID == 0 {
		// User not found
		// Handle invalid credentials
		return
	}

	// Compare hashed password with provided password
	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(r.FormValue("password")))
	if err != nil {
		// Handle invalid credentials
		return
	}

	// Generate a session token
	sessionToken := functions.GenerateSessionToken()

	// Store the session in the database with an expiration time
	functions.StoreSessionInDB(db.Dbase, sessionToken, user.UserID)

	// Set a cookie with the session token
	http.SetCookie(w, &http.Cookie{
		Name:     "session-token",
		Value:    sessionToken,
		HttpOnly: true,
		MaxAge:   60 * 15, // 15 minutes
	})
}
