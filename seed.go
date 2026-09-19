package main

import (
	"log"
	"jadwal-api/core/database"
)

func main() {
	database.Connect()
	log.Println("Seeder invoked.")
}
