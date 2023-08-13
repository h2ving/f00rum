package db

import (
	"database/sql"
	"log"
	"os"

	_ "github.com/mattn/go-sqlite3"
)

var Dbase *sql.DB

func StartDB() {
	db, err := sql.Open("sqlite3", "./database.db")
	if err != nil {
		log.Fatal(err)
	}
	err = db.Ping()
	if err != nil {
		log.Fatal("Cannot ping db!")
	}

	_, error := db.Exec(ReadTable("database.sql"))
	if error != nil {
		log.Fatal(error)
	}

	Dbase = db
}

func ReadTable(filename string) string {
	data, _ := os.ReadFile("./db/" + filename)
	return string(data)
}
