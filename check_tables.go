package main
import (
	"fmt"
	"jadwal-api/core/database"
	"github.com/joho/godotenv"
)
func main() {
	godotenv.Load()
	database.Connect()
	tables := []string{"classes", "sessions", "schedules", "subjects"}
	for _, t := range tables {
		fmt.Printf("--- %s ---\n", t)
		rows, _ := database.DB.Query("SELECT column_name FROM information_schema.columns WHERE table_name = $1", t)
		for rows.Next() {
			var col string
			rows.Scan(&col)
			fmt.Println(col)
		}
	}
}
