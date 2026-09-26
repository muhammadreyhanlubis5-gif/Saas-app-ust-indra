package main
import (
	"fmt"
	"log"
	"jadwal-api/core/database"
	"github.com/joho/godotenv"
)

func main() {
	godotenv.Load()
	database.ConnectDB()
	rows, err := database.DB.Query("SELECT id, username, role FROM users WHERE role = 'SUPER_ADMIN'")
	if err != nil { log.Fatal(err) }
	for rows.Next() {
		var id, username, role string
		rows.Scan(&id, &username, &role)
		fmt.Printf("ID: %s, Username: %s, Role: %s\n", id, username, role)
	}
}
