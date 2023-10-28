package chat

import (
	"fmt"
	"log"
	"real-time-forum/db"
)

func fetchChatHistory(c *Client, recipientID int, page int) {

	chatHistory, err := getMessages(c.ID, recipientID, page)
	if err != nil {
		log.Printf("Error fetching chat history: %v", err)
		return
	}

	response := make(map[string]interface{})
	response["action"] = "chat_history"
	response["content"] = chatHistory

	c.Conn.WriteJSON(response)
}

func getMessages(senderID, recipientID int, page int) ([]ChatMessage, error) {
	perPage := 10
	offset := (page - 1) * perPage

	// Count total amount of message to know when to stop fetching
	countQuery := "SELECT COUNT(*) FROM ChatMessages WHERE (senderID = ? AND receiverID = ?) OR (senderID = ? AND receiverID = ?)"
	var totalMessages int
	err := db.Dbase.QueryRow(countQuery, senderID, recipientID, recipientID, senderID).Scan(&totalMessages)
	if err != nil {
		return nil, err
	}

	if offset >= totalMessages {
		return []ChatMessage{}, nil
	} else {
		// Modify your SQL query to limit and offset
		query := "SELECT messageID, senderID, receiverID, message, strftime('%Y-%m-%d %H:%M:%S', createdAt, '+3 hours') AS formattedCreatedAt FROM ChatMessages WHERE (senderID = ? AND receiverID = ?) OR (senderID = ? AND receiverID = ?) ORDER BY createdAt DESC LIMIT ? OFFSET ?"
		rows, err := db.Dbase.Query(query, senderID, recipientID, recipientID, senderID, perPage, offset)
		if err != nil {
			return nil, err
		}
		defer rows.Close()

		var chatHistory []ChatMessage
		for rows.Next() {
			var msg ChatMessage
			if err := rows.Scan(&msg.MessageID, &msg.SenderID, &msg.ReceiverID, &msg.Message, &msg.CreatedAt); err != nil {
				return nil, err
			}
			chatHistory = append(chatHistory, msg)
		}

		return chatHistory, nil
	}
}

func fetchUsers(c *Client) {
	users, _ := GetUsers() // Assuming GetUsers fetches users from the DB
	response := FetchMessage{
		Action: "update_users",
		Data:   users,
	}
	c.Username = users[c.ID]
	c.Conn.WriteJSON(response)
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

func sendMessage(messageData map[string]interface{}, c *Client) {
	message, ok := messageData["content"].(string)
	if !ok {
		log.Printf("Invalid message format: %v", messageData)
	}
	if c == nil {
		fmt.Println("client nil")
	}
	var recipient *Client
	for key, value := range c.Hub.Clients {
		if key.Username == messageData["recipient"] {
			recipient = key
			if value {
				key.Conn.WriteJSON(messageData)
			}
		}
	}
	var recipientID int
	if recipient == nil {
		log.Printf("Online recipient not found: %v", messageData["recipient"])
		err := db.Dbase.QueryRow("SELECT userID FROM Users WHERE username = ?", messageData["recipient"]).Scan(&recipientID)
		if err != nil {
			log.Printf("Recipient not found: %v", messageData["recipient"])
		}
		err = storeMessage(c.ID, recipientID, message)
		if err != nil {
			log.Print("Error while storing message to database")
			return
		}
	} else {
		err := storeMessage(c.ID, recipient.ID, message)
		if err != nil {
			log.Print("Error while storing message to database")
			return
		}
	}

}
func storeMessage(senderID, recipientID int, message string) error {
	_, err := db.Dbase.Exec("INSERT INTO ChatMessages (senderID, receiverID, message) VALUES (?, ?, ?)", senderID, recipientID, message)
	fmt.Println("storeMessage: ", err)
	return err
}
