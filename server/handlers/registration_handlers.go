package handlers

import (
	"encoding/json"
	"fmt"
	"golang.org/x/crypto/bcrypt"
	"net/http"
	"real-time-forum/db"
	"real-time-forum/server"
	"real-time-forum/server/functions"
	"strconv"
)

func HandleRegistration(w http.ResponseWriter, r *http.Request) {
	var regData server.RegistrationData

	decoder := json.NewDecoder(r.Body)
	err := decoder.Decode(&regData)
	if err != nil {
		http.Error(w, "Error parsing JSON: "+err.Error(), http.StatusBadRequest)

		return
	}

	// Hash the password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(regData.Password), bcrypt.DefaultCost)
	if err != nil {
		http.Error(w, "Error hashing password", http.StatusInternalServerError)
		return
	}
	ageInt, _ := strconv.Atoi(regData.Age)
	// Insert user data into the database
	_, err = db.Dbase.Exec("INSERT INTO Users (email, username, password, firstName, lastName, age, gender) VALUES (?, ?, ?, ?, ?, ?, ?)",
		regData.Email, regData.Username, hashedPassword, regData.FirstName, regData.LastName, ageInt, regData.Gender)
	if err != nil {
		http.Error(w, "Error registering user"+err.Error(), http.StatusInternalServerError)
		return
	}

	user, err := functions.GetUserByEmailOrNickname(db.Dbase, regData.Username)
	if err != nil {
		// Handle error
		fmt.Printf("Error getting user by email or nickname: %v <> error: %v \n", regData.Username, err)
		return
	}

	if user.UserID == 0 {
		// User not found
		// Handle invalid credentials
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
		"message": "Registration successful",
	})
}
