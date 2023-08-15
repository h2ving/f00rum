package cmd

import "real-time-forum/db"

var (
	Sessions = make(map[string]int)
	SecretKey = []byte("secret")
)

func main() {
	db.StartDB()
}