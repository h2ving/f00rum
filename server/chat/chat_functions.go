package chat

import (
	"github.com/gorilla/websocket"
	"real-time-forum/db"
)

func fetchAndSendUsers(conn *websocket.Conn) {
	users, _ := GetUsers() // Assuming GetUsers fetches users from the DB
	response := WSMessage{
		Action: "update_users",
		Data:   users,
	}
	conn.WriteJSON(response)
}

func GetUsers() (map[int]string, error) {
	users := make(map[int]string) // Initialize the map

	rows, err := db.Dbase.Query("SELECT userID, username FROM Users")
	if err != nil {
		return users, err
	}
	defer rows.Close()

	var userID int
	var username string

	for rows.Next() {
		if err := rows.Scan(&userID, &username); err != nil {
			return users, err
		}
		users[userID] = username // Add to the map
	}
	return users, nil
}
