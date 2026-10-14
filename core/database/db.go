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
	
	// Otomatis Buat Tabel Penting (Support Tickets & Konfirmasi Pembayaran) jika belum ada
	autoMigrateTables()

	// Otomatis Seed Super Admin jika belum ada
	seedSuperAdmin()
}

func autoMigrateTables() {
	if DB == nil {
		return
	}

	_, err := DB.Exec(`
		CREATE TABLE IF NOT EXISTS support_tickets (
			id SERIAL PRIMARY KEY,
			name VARCHAR(255) NOT NULL,
			contact VARCHAR(100) NOT NULL,
			school VARCHAR(255) DEFAULT 'Pengguna Umum',
			category VARCHAR(100) NOT NULL,
			message TEXT NOT NULL,
			status VARCHAR(20) DEFAULT 'MENUNGGU',
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		);

		CREATE TABLE IF NOT EXISTS payment_confirmations (
			id SERIAL PRIMARY KEY,
			invoice VARCHAR(100) NOT NULL UNIQUE,
			plan VARCHAR(50) NOT NULL,
			amount BIGINT NOT NULL,
			method VARCHAR(100) NOT NULL,
			sender_name VARCHAR(255) NOT NULL,
			bank_name VARCHAR(100) NOT NULL,
			notes TEXT,
			proof_image TEXT,
			status VARCHAR(50) DEFAULT 'MENUNGGU_VERIFIKASI',
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		);
	`)
	if err != nil {
		log.Println("[Database] Gagal menjalankan auto-migrasi tabel:", err)
	} else {
		log.Println("[Database] Auto-migrasi tabel berhasil!")
	}
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
