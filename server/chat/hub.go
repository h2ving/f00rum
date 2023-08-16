package chat

func newHub() *Hub {
	return &Hub{
		Broadcast: make(chan []byte),
		Register: make(chan *Client),
		Unregister: make(chan *Client),
		Clients: make(map[*Client]bool),
	}
}

func (h *Hub) run() {
	for {
		select {
		case client := <-h.Register:
			h.Clients[client] = true
		case client := <-h.Unregister:
			if _, ok := h.Clients[client]; ok {
				delete(h.Clients, client)
				close(client.Send)
			}
		case message := <- h.Broadcast:
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