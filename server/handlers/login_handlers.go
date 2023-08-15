package handlers

import (
	"database/sql"
	"net/http"
	"real-time-forum/db"
	"real-time-forum/server"
	"golang.org/x/crypto/bcrypt"
)

func handleLogin(w http.ResponseWriter, r *http.Request) {
    // Parse form data
    err := r.ParseForm()
    if err != nil {
        // Handle error
        return
    }

    // Retrieve user by email or nickname
    emailOrNickname := r.FormValue("email_or_nickname")
    user, err := getUserByEmailOrNickname(db.Dbase, emailOrNickname)
    if err != nil {
        // Handle error
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

    // Set up a session (e.g., using cookies or JWT) upon successful login
    // ...

    // Redirect to the user's dashboard or send a response
}

func getUserByEmailOrNickname(db *sql.DB, emailOrNickname string) (server.User, error) {
    query := "SELECT * FROM Users WHERE email = ? OR username = ? LIMIT 1"

    var user server.User
    err := db.QueryRow(query, emailOrNickname, emailOrNickname).Scan(
        &user.UserID, &user.Email, &user.Username, &user.Password,
        &user.FirstName, &user.LastName, &user.Gender,
    )
    if err != nil {
        if err == sql.ErrNoRows {
            // User not found
            return server.User{}, nil
        }
        return server.User{}, err
    }

    return user, nil
}
