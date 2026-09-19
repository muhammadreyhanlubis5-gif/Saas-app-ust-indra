package database

import (
	"database/sql"
	"log"
	"os"

	_ "github.com/lib/pq"
)

var DB *sql.DB

func Connect() {
	dsn := os.Getenv("DATABASE_URL") // Diset di Neon & Vercel
	if dsn == "" {
		log.Println("DATABASE_URL is not set, skipping DB connection")
		return
	}

	var err error
	DB, err = sql.Open("postgres", dsn)
	if err != nil {
		log.Fatalf("Failed to connect to Neon DB: %v", err)
	}

	if err = DB.Ping(); err != nil {
		log.Fatalf("Failed to ping Neon DB: %v", err)
	}

	log.Println("Successfully connected to Neon Serverless Postgres!")
}
