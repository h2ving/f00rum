package chat

import (
	"encoding/json"
	"fmt"
	"github.com/gorilla/websocket"
	"log"
	"net/http"
	"real-time-forum/server"
)

var (
	newline = []byte{'\n'}
	space   = []byte{' '}
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

// readPump pumps messages from the websocket connection to the hub.
//
// The application runs readPump in a per-connection goroutine. The application
// ensures that there is at most one reader on a connection by executing all
// reads from this goroutine.
func (c *Client) readPump() {
	defer func() {
		c.Hub.Unregister <- c
		c.Conn.Close()
		log.Println(c.Username, " disconnected")

	}()
	for {
		_, message, err := c.Conn.ReadMessage()

		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("Error : %v", err)
			}
			break
		}
		// Assuming your messages are in JSON format
		var messageData map[string]interface{}
		if err := json.Unmarshal(message, &messageData); err != nil {
			log.Printf("Error parsing JSON: %v", err)
			continue
		}

		// Check the action field in the message
		action, ok := messageData["action"].(string)
		if !ok {
			log.Printf("Invalid message format: %v", messageData)
			continue
		}

		// Handle different actions here
		switch action {
		case "fetch_users":
			// Handle the fetch_users action here
			fetchUsers(c)
		case "send_message":
			sendMessage(messageData, c)
		case "fetch_chat_history":
			fmt.Println(messageData)
			// fetchChatHistory(messageData, c.ID)
		default:
			// Handle other actions as needed
		}

	}
}

// writePump pumps messages from the hub to the websocket connection.
//
// A goroutine running writePump is started for each connection. The
// application ensures that there is at most one writer to a connection by
// executing all writes from this goroutine.
func (c *Client) writePump() {
	defer func() {
		c.Conn.Close()
	}()
	for {
		select {
		case message, ok := <-c.Send:
			if !ok {
				// The hub closed the channel.
				c.Conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			w, err := c.Conn.NextWriter(websocket.TextMessage)
			if err != nil {
				return
			}
			w.Write(message)

			// Add queued chat messages to the current websocket message.
			n := len(c.Send)
			for i := 0; i < n; i++ {
				w.Write(newline)
				w.Write(<-c.Send)
			}

			if err := w.Close(); err != nil {
				return
			}
		}
	}
}

// ServeWs handles websocket requests from the peer.
func ServeWs(hub *Hub, w http.ResponseWriter, r *http.Request) {
	log.Println(server.UserID, " connected")
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}
	client := &Client{Hub: hub, Conn: conn, Send: make(chan []byte, 256), ID: server.UserID, Online: true}
	hub.Register <- client
	// Allow collection of memory referenced by the caller by doing all work in
	// new goroutines.
	go client.writePump()
	go client.readPump()
}

func HandleNewUserWsAlert(newUser server.User, h *Hub) {
	message := map[string]interface{}{
		"type": "newUser",
		"data": newUser,
	}
	jsonData, _ := json.Marshal(message)
	// Broadcast the message to all connected clients
	h.Broadcast <- jsonData
}
