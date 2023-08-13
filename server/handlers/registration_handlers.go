package handlers

import (
	"fmt"
	"net/http"
	 "real-time-forum/db"
	"golang.org/x/crypto/bcrypt"
)

func handleRegistration(w http.ResponseWriter, r *http.Request) {
	err := r.ParseForm()
	if err != nil {
		// TODO: handle error
		fmt.Println("Error parsing registration form: ", err)
		return
	}

	// Extract form values
    email := r.FormValue("email")
	username := r.FormValue("username")
	firstName := r.FormValue("firstName")
	lastName := r.FormValue("lastName")
	gender := r.FormValue("gender")

    // Hash the password
    hashedPassword, err := bcrypt.GenerateFromPassword([]byte(r.FormValue("password")), bcrypt.DefaultCost)
    if err != nil {
        // Handle error
		fmt.Println("Error ")
        return
    }

    // Insert user data into the database
    _, err = db.Exec("INSERT INTO Users (email, username, password, firstName, lastName, gender) VALUES (?, ?, ?, ?, ?, ?)",
        email, username, hashedPassword, firstName, lastName, gender)
    if err != nil {
        // Handle error
        return
    }

	// Redirect to a success page or send a response
}