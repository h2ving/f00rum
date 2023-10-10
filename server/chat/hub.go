package chat

import (
	"encoding/json"
	"log"
	"real-time-forum/db"
)

func NewHub() *Hub {
	return &Hub{
		Broadcast:  make(chan []byte),
		Clients:    make(map[*Client]int),
		Register:   make(chan *Client),
		Unregister: make(chan *Client),
		FetchUsers: make(chan *map[int]string),
	}
}

func (h *Hub) Run() {
	for {
		select {
		case <-h.FetchUsers:
			userList, err := GetUsers() // Assume this function fetches the user list from the DB
			if err != nil {
				log.Println("Failed to fetch users:", err)
				continue
			}

			userListJSON, err := json.Marshal(userList)
			if err != nil {
				log.Println("Failed to marshal user list:", err)
				continue
			}

			// Broadcast to all connected clients
			for client := range h.Clients {
				select {
				case client.Send <- userListJSON:
				default:
					close(client.Send)
					delete(h.Clients, client)
				}
			}
		case client := <-h.Register:
			h.Clients[client] = 1
		case client := <-h.Unregister:
			if _, ok := h.Clients[client]; ok {
				delete(h.Clients, client)
				close(client.Send)
			}
		case message := <-h.Broadcast:
			for client := range h.Clients {
				select {
				case client.Send <- message:
				default:
					close(client.Send)
					delete(h.Clients, client)
				}
			}
		}
	}
}

func storeMessage(senderID, recipientID int, message string) error {
	_, err := db.Dbase.Exec("INSERT INTO ChatMessages (senderID, receiverID, message) VALUES (?, ?, ?)", senderID, recipientID, message)
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

func loadChatHistory(h *Hub, senderID, recipientID int) {
	messages, err := getMessages(senderID, recipientID, 10)
	if err != nil {
		log.Println("Failed to load chat history:", err)
		return
	}

	client := FindClientBySenderID(h, senderID)
	for _, message := range messages {
		client.Send <- []byte(message)
	}
}
