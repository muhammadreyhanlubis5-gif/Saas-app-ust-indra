package main
import (
	"fmt"
	"jadwal-api/core/database"
	"github.com/joho/godotenv"
)
func main() {
	godotenv.Load()
	database.Connect()
	_, err := database.DB.Exec("DELETE FROM schools WHERE id = '60d25924-29ce-4277-9b4f-80d41d7fcd63'")
	if err != nil { fmt.Println("Error:", err) } else { fmt.Println("Deleted successfully") }
}
