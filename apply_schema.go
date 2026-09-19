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

	content, err := ioutil.ReadFile("database/03_final_schema.sql")
	if err != nil { log.Fatal(err) }

	_, _ = db.Exec("DROP TABLE IF EXISTS subjects CASCADE; DROP TABLE IF EXISTS users CASCADE; DROP TABLE IF EXISTS schools CASCADE; DROP TYPE IF EXISTS user_role;")

	_, err = db.Exec(string(content))
	if err != nil { log.Fatal("Error executing SQL: ", err) }

	log.Println("Schema successfully applied!")
}
