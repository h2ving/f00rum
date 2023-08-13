package handlers

import (
	"net/http"
	"golang.org/x/crypto/bcrypt"
	"real-time-forum/db"
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
    user, err := getUserByEmailOrNickname(Dbase, emailOrNickname)
    if err != nil {
        // Handle error
        return
    }

    if user.ID == 0 {
        // User not found
        // Handle invalid credentials
        return
    }
    // Compare hashed password with provided password
    err = bcrypt.CompareHashAndPassword([]byte(user.HashedPassword), []byte(r.FormValue("password")))
    if err != nil {
        // Handle invalid credentials
        return
    }

    // Set up a session (e.g., using cookies or JWT) upon successful login
    // ...

    // Redirect to the user's dashboard or send a response
}

func getUserByEmailOrNickname(db *sql.DB, emailOrNickname string) (User, error) {
    query := "SELECT * FROM Users WHERE email = ? OR nickname = ? LIMIT 1"

    var user User
    err := db.QueryRow(query, emailOrNickname, emailOrNickname).Scan(
        &user.ID, &user.Nickname, &user.Age, &user.Gender,
        &user.FirstName, &user.LastName, &user.Email, &user.HashedPassword,
    )
    if err != nil {
        if err == sql.ErrNoRows {
            // User not found
            return User{}, nil
        }
        return User{}, err
    }

    return user, nil
}
