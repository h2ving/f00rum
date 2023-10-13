package chat

import (
	"fmt"
	"log"
	"real-time-forum/db"
)

// TODO throttle load
func fetchChatHistory(c *Client, recipientID int) {

	chatHistory, err := GetChatHistory(c.ID, recipientID)
	if err != nil {
		log.Printf("Error fetching chat history: %v", err)
		return
	}

	response := make(map[string]interface{})
	response["action"] = "chat_history"
	response["content"] = chatHistory

	c.Conn.WriteJSON(response)
}

func GetChatHistory(senderID, recipientID int) ([]ChatMessage, error) {

	// Query the database to retrieve chat history
	query := "SELECT * FROM ChatMessages WHERE (senderID = ? AND receiverID = ?) OR (senderID = ? AND receiverID = ?) ORDER BY createdAt"
	rows, err := db.Dbase.Query(query, senderID, recipientID, recipientID, senderID)
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
	if recipient == nil {
		log.Printf("Recipient not found: %v", messageData["recipient"])
		return
	}
	err := storeMessage(c.ID, recipient.ID, message)
	if err != nil {
		return
	}
}
func storeMessage(senderID, recipientID int, message string) error {
	_, err := db.Dbase.Exec("INSERT INTO ChatMessages (senderID, receiverID, message) VALUES (?, ?, ?)", senderID, recipientID, message)
	fmt.Println("storeMessage: ", err)
	return err
}

func getMessages(senderID, recipientID int, limit int) ([]string, error) {
	rows, err := db.Dbase.Query("SELECT message FROM ChatMessages WHERE (senderID = ? AND receiverID = ?) OR (senderID = ? AND receiverID = ?) ORDER BY createdAt DESC LIMIT ?", senderID, recipientID, recipientID, senderID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var messages []string
	for rows.Next() {
		var message string
		if err := rows.Scan(&message); err != nil {
			return nil, err
		}
		messages = append(messages, message)
	}
	return messages, nil
}
