package main

import (
	"log"
	"os"
	"io/ioutil"
	"database/sql"
	_ "github.com/lib/pq"
	"github.com/joho/godotenv"
)

func main() {
	godotenv.Load()
	dsn := os.Getenv("DATABASE_URL")
	db, err := sql.Open("postgres", dsn)
	if err != nil { log.Fatal(err) }

	content, err := ioutil.ReadFile("database/07_forgot_password.sql")
	if err != nil { log.Fatal(err) }

	_, err = db.Exec(string(content))
	if err != nil { log.Fatal("Error executing SQL: ", err) }

	log.Println("Migration successfully applied!")
}
