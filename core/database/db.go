package database

import (
	"database/sql"
	"log"
	"os"

	_ "github.com/lib/pq"
	"golang.org/x/crypto/bcrypt"
)

var DB *sql.DB

func Connect() {
	dsn := os.Getenv("DATABASE_URL") // Diset di Neon & Vercel
	if dsn == "" {
		log.Println("DATABASE_URL is not set, skipping DB connection")
		return
	}

	var err error
	DB, err = sql.Open("postgres", dsn)
	if err != nil {
		log.Fatalf("Failed to connect to Neon DB: %v", err)
	}

	if err = DB.Ping(); err != nil {
		log.Fatalf("Failed to ping Neon DB: %v", err)
	}

	log.Println("Successfully connected to Neon Serverless Postgres!")
	
	// Otomatis Seed Super Admin jika belum ada
	seedSuperAdmin()
}

func seedSuperAdmin() {
	var count int
	err := DB.QueryRow("SELECT COUNT(*) FROM users WHERE role = 'SUPER_ADMIN' AND username = 'admin'").Scan(&count)
	if err != nil {
		log.Println("Gagal mengecek super admin:", err)
		return
	}

	if count == 0 {
		hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("admin123"), bcrypt.DefaultCost)
		_, err = DB.Exec(`
			INSERT INTO users (name, username, password, role) 
			VALUES ('Master Admin', 'admin', $1, 'SUPER_ADMIN')
		`, string(hashedPassword))
		if err == nil {
			log.Println("Super Admin (admin / admin123) berhasil dibuat!")
		}
	}
}
