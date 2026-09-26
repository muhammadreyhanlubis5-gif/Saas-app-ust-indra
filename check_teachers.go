package main
import (
	"fmt"
	"jadwal-api/core/database"
	"github.com/joho/godotenv"
)
func main() {
	godotenv.Load()
	database.Connect()
	rows, _ := database.DB.Query(`
		SELECT column_name, data_type 
		FROM information_schema.columns 
		WHERE table_name = 'teachers'
	`)
	for rows.Next() {
		var col, dtype string
		rows.Scan(&col, &dtype)
		fmt.Printf("%s (%s)\n", col, dtype)
	}
}
