package main

import (
	"database/sql"
	"fmt"
	"io/ioutil"
	"log"
	"os"

	_ "github.com/lib/pq"
)

func main() {
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		log.Fatal("DATABASE_URL is not set")
	}

	db, err := sql.Open("postgres", dbURL)
	if err != nil {
		log.Fatal("Error connecting to database: ", err)
	}
	defer db.Close()

	content, err := ioutil.ReadFile("database/06_school_sessions.sql")
	if err != nil {
		log.Fatal("Error reading sql file: ", err)
	}

	_, err = db.Exec(string(content))
	if err != nil {
		log.Fatal("Error executing SQL: ", err)
	}

	fmt.Println("Migration 06 applied successfully!")
}
