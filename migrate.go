package main

import (
	"database/sql"
	"fmt"
	"io/ioutil"
	"log"

	_ "github.com/lib/pq"
)

func main() {
	dsn := "postgresql://neondb_owner:npg_YCKy0x9RNaEF@ep-wandering-dawn-b32xqqkl-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
	
	db, err := sql.Open("postgres", dsn)
	if err != nil {
		log.Fatalf("Error opening db: %v", err)
	}
	defer db.Close()

	err = db.Ping()
	if err != nil {
		log.Fatalf("Error connecting to db: %v", err)
	}
	fmt.Println("Connected to Neon DB successfully.")

	// Read schema.sql
	content, err := ioutil.ReadFile("database/schema.sql")
	if err != nil {
		log.Fatalf("Error reading schema.sql: %v", err)
	}

	// Execute schema
	queries := string(content)
	_, err = db.Exec(queries)
	if err != nil {
		// Sometimes executing multiple statements at once needs to be handled if there are errors, 
		// but pq usually handles a block of SQL fine.
		log.Fatalf("Error executing schema: %v", err)
	}

	fmt.Println("Schema successfully migrated to Neon!")
}
