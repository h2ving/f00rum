package handlers

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"real-time-forum/cmd"
	"real-time-forum/db"
	"real-time-forum/server"

	"github.com/gofrs/uuid"
	"golang.org/x/crypto/bcrypt"
)

func handleLogin(w http.ResponseWriter, r *http.Request) {
    // Parse form data
    err := r.ParseForm()
    if err != nil {
        log.Fatalf("Error parsing form data: %v", err)
        return
    }

    // Retrieve user by email or nickname
    emailOrNickname := r.FormValue("email_or_nickname")
    user, err := getUserByEmailOrNickname(db.Dbase, emailOrNickname)
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

    // Set up a session (e.g., using cookies or JWT) upon successful login
    
    // Generate a session token
    sessionToken := generateSessionToken()
    // Store the session token and user ID in the sessions map
    cmd.Sessions[sessionToken] = user.UserID
    // Set a cookie with the session token
    http.SetCookie(w, &http.Cookie{
        Name:     "session-token",
        Value:    sessionToken,
        HttpOnly: true,
        MaxAge:   60 * 15, // 15 minutes
    })

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

func generateSessionToken() string {
    /* // COMPLETELY RANDOMIZED
    // generate a unique session token using UUID
    sessionUUID, err := uuid.NewV4()
    if err != nil {
        log.Fatalf("Error generating session token: %v", err)
    }
    log.Printf("Generated V4 UUID: %v", sessionUUID)
    */

    // Parse a UUID from secretkey
    u3, err := uuid.FromBytes(cmd.SecretKey)
    if err != nil {
        log.Fatalf("Failed to parse UUID %q: %v", cmd.SecretKey, err)
    }
    log.Printf("successfully parsed UUID %v", u3)
    // return the token
    return u3.String()
}

