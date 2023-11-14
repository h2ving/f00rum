package functions

import (
	"crypto/rand"
	"database/sql"
	"encoding/hex"
	"fmt"
	"log"
	"real-time-forum/server"
	"time"
)

func GetUserByEmailOrNickname(db *sql.DB, emailOrNickname string) (server.User, error) {
	query := "SELECT * FROM Users WHERE email = ? OR username = ? LIMIT 1"
	var user server.User
	err := db.QueryRow(query, emailOrNickname, emailOrNickname).Scan(
		&user.UserID, &user.Username, &user.Password, &user.Email,
		&user.FirstName, &user.LastName, &user.Age, &user.Gender,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			// User not found
			fmt.Println("User not found")
			return server.User{}, nil
		}
		return server.User{}, err
	}

	return user, nil
}

func GenerateSessionToken() string {
	b := make([]byte, 16)
	_, err := rand.Read(b)
	if err != nil {
		log.Fatalf("Error generating session token: %v", err)
	}
	return hex.EncodeToString(b)
}

func StoreSessionInDB(db *sql.DB, sessionToken string, userID int) {
	// Set the session expiration time
	expiresAt := time.Now().Add(15 * time.Minute)
	server.UserID = userID
	// Insert or replace the session in the database
	_, err := db.Exec(`
		INSERT OR REPLACE INTO Sessions (sessionID, userID, expiresAt) 
		VALUES (?, ?, ?)`,
		sessionToken, userID, expiresAt)
	if err != nil {
		log.Fatalf("Error storing or updating session in database: %v", err)
	}
}
