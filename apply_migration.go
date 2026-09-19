package main

import (
	"log"
	"os"
	"io/ioutil"
	"database/sql"
	_ "github.com/lib/pq"
)

func main() {
	dsn := os.Getenv("DATABASE_URL")
	db, err := sql.Open("postgres", dsn)
	if err != nil { log.Fatal(err) }

	content, err := ioutil.ReadFile("database/04_alter_schools.sql")
	if err != nil { log.Fatal(err) }

	_, err = db.Exec(string(content))
	if err != nil { log.Fatal("Error executing SQL: ", err) }

	log.Println("Migration successfully applied!")
}
