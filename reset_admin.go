package main
import (
	"fmt"
	"log"
	"jadwal-api/core/database"
	"github.com/joho/godotenv"
	"golang.org/x/crypto/bcrypt"
)

func main() {
	godotenv.Load()
	database.Connect()

	// Cek siapa usernamenya
	var id, username string
	err := database.DB.QueryRow("SELECT id, username FROM users WHERE role = 'SUPER_ADMIN'").Scan(&id, &username)
	if err != nil {
		log.Fatal("Super admin belum ada: ", err)
	}

	// Reset password to "admin123"
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte("admin123"), bcrypt.DefaultCost)
	if err != nil {
		log.Fatal(err)
	}

	_, err = database.DB.Exec("UPDATE users SET password = $1 WHERE role = 'SUPER_ADMIN'", string(hashedPassword))
	if err != nil {
		log.Fatal(err)
	}

	fmt.Printf("Berhasil reset password untuk admin dengan username '%s' menjadi: admin123\n", username)
}
