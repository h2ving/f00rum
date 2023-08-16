package chat

import "github.com/gorilla/websocket"

type Client struct {
	Hub *Hub
	// Websocket connection
	Conn *websocket.Conn
	// Buffered channel for outbound messages
	Send chan []byte
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
}