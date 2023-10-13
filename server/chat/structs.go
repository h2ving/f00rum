package chat

import "github.com/gorilla/websocket"

type Client struct {
	Hub *Hub
	// Websocket connection
	Conn *websocket.Conn
	// Buffered channel for outbound messages
	Send     chan []byte
	ID       int
	Username string
	Online   bool
}

type Hub struct {
	// Registered clients.
	Clients map[*Client]bool

	// Inbound messages from the clients.
	Broadcast chan []byte

	// Register requests from the clients.
	Register chan *Client

	// Unregister requests from the clients.
	Unregister chan *Client

	FetchUsers chan *map[int]string
}

type FetchMessage struct {
	Action string      `json:"action"`
	Data   interface{} `json:"data,omitempty"`
}

type Message struct {
	Action    string `json:"action"`
	Sender    string `json:"sender"`
	Recipient string `json:"recipient"`
	Content   string `json:"content"`
}

type ChatMessage struct {
	MessageID  int
	SenderID   int
	ReceiverID int
	Message    string
	CreatedAt  string
}
