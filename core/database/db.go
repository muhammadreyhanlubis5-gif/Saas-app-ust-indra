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
	
	// Otomatis Buat Tabel Penting jika belum ada
	autoMigrateTables()

	// Otomatis Seed Super Admin jika belum ada
	seedSuperAdmin()
}

func autoMigrateTables() {
	if DB == nil {
		return
	}

	// 1. Pastikan kolom di tabel schools lengkap untuk arsitektur multi-tenant SaaS
	_, _ = DB.Exec(`
		ALTER TABLE schools ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'ACTIVE';
		ALTER TABLE schools ADD COLUMN IF NOT EXISTS database_limit INT DEFAULT 100;
	`)

	// 2. Tabel Support Tickets (Pusat Bantuan) dengan relasi Tenant_ID dan status standar B2B SaaS
	_, err := DB.Exec(`
		CREATE TABLE IF NOT EXISTS support_tickets (
			id SERIAL PRIMARY KEY,
			tenant_id UUID,
			name VARCHAR(255) NOT NULL,
			contact VARCHAR(100) NOT NULL,
			school VARCHAR(255) DEFAULT 'Pengguna Umum',
			category VARCHAR(100) NOT NULL,
			message TEXT NOT NULL,
			status VARCHAR(50) DEFAULT 'Open',
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		);

		ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS tenant_id UUID;
	`)
	if err != nil {
		log.Println("[Database] Gagal migrasi support_tickets:", err)
	}

	// Standarisasi status support_tickets jika ada data lama
	_, _ = DB.Exec(`
		UPDATE support_tickets SET status = 'Open' WHERE status = 'MENUNGGU' OR status IS NULL;
		UPDATE support_tickets SET status = 'In Progress' WHERE status = 'DIPROSES';
		UPDATE support_tickets SET status = 'Resolved' WHERE status = 'SELESAI';
	`)

	// 3. Tabel Konfirmasi Pembayaran & Faktur (Tagihan & Keuangan)
	// Status ENUM: 'Menunggu Pembayaran', 'Berhasil Dibayar', 'Dibatalkan'
	_, err = DB.Exec(`
		CREATE TABLE IF NOT EXISTS payment_confirmations (
			id SERIAL PRIMARY KEY,
			tenant_id UUID,
			invoice VARCHAR(100) NOT NULL UNIQUE,
			plan VARCHAR(50) NOT NULL,
			amount BIGINT NOT NULL,
			method VARCHAR(100) NOT NULL,
			sender_name VARCHAR(255) NOT NULL,
			bank_name VARCHAR(100) NOT NULL,
			notes TEXT,
			proof_image TEXT,
			status VARCHAR(50) DEFAULT 'Menunggu Pembayaran',
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		);

		ALTER TABLE payment_confirmations ADD COLUMN IF NOT EXISTS tenant_id UUID;
	`)
	if err != nil {
		log.Println("[Database] Gagal migrasi payment_confirmations:", err)
	}

	// Standarisasi status payment_confirmations dari legacy
	_, _ = DB.Exec(`
		UPDATE payment_confirmations SET status = 'Menunggu Pembayaran' WHERE status = 'MENUNGGU_VERIFIKASI' OR status IS NULL;
		UPDATE payment_confirmations SET status = 'Berhasil Dibayar' WHERE status = 'TERVERIFIKASI';
		UPDATE payment_confirmations SET status = 'Dibatalkan' WHERE status = 'DITOLAK';
	`)

	// 4. Tabel Paket Lisensi (Source of Truth untuk harga masa depan)
	_, err = DB.Exec(`
		CREATE TABLE IF NOT EXISTS subscription_plans (
			id VARCHAR(50) PRIMARY KEY,
			name VARCHAR(255) NOT NULL,
			badge VARCHAR(50),
			tier VARCHAR(50),
			price BIGINT NOT NULL,
			duration_months INT NOT NULL,
			duration_label VARCHAR(100),
			description TEXT,
			features TEXT,
			is_active BOOLEAN DEFAULT TRUE,
			is_popular BOOLEAN DEFAULT FALSE,
			is_premium BOOLEAN DEFAULT FALSE,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		);
	`)
	if err != nil {
		log.Println("[Database] Gagal migrasi subscription_plans:", err)
	}

	// Seeding Paket Lisensi default jika kosong
	var planCount int
	_ = DB.QueryRow("SELECT COUNT(*) FROM subscription_plans").Scan(&planCount)
	if planCount == 0 {
		_, _ = DB.Exec(`
			INSERT INTO subscription_plans (id, name, badge, tier, price, duration_months, duration_label, description, is_active, is_popular, is_premium)
			VALUES 
			('pkg-standar', 'Lisensi Semester Ganjil', 'Standar', 'standar', 254205, 6, '6 Bulan (1 Semester)', 'Manajemen jadwal 1 semester lengkap untuk dewan guru dan rombel kelas.', TRUE, FALSE, FALSE),
			('pkg-populer', 'Lisensi Lengkap 1 Tahun', 'Populer', 'populer', 480000, 12, '12 Bulan (2 Semester Penuh)', 'Dua semester penuh, modul cetak kartu ujian, dan garansi bebas bentrok.', TRUE, TRUE, FALSE),
			('pkg-premium', 'Multi-Kampus & Yayasan', 'Premium', 'premium', 1250000, 12, '12 Bulan (Multi-Unit Terpadu)', 'Solusi terpusat untuk yayasan dengan multi unit sekolah (SD, SMP, SMA/SMK).', TRUE, FALSE, TRUE);
		`)
		log.Println("[Database] Default subscription plans seeded!")
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
