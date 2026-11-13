package main

import (
	"database/sql"
	"flag"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"sort"
	"strings"

	_ "github.com/lib/pq"
)

type MigrationFile struct {
	Version string
	Name    string
	Type    string // "up" or "down"
	Path    string
}

func main() {
	var migrationsDir string
	var confirm bool
	flag.StringVar(&migrationsDir, "dir", "core/database/migrations", "Path to migrations directory")
	flag.BoolVar(&confirm, "confirm", false, "Confirm destructive rollback")
	flag.Parse()

	args := flag.Args()
	if len(args) == 0 {
		fmt.Println("Usage: go run cmd/migrate/main.go [up|down|status|version] [--dir=path] [--confirm]")
		os.Exit(1)
	}
	command := args[0]

	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		log.Fatal("[Migrate CLI Error] DATABASE_URL environment variable is required.")
	}

	// Safety check: Prevent destructive rollback on production without --confirm
	if command == "down" && !confirm {
		log.Fatal("[Migrate CLI Safety] Rollback requires explicit --confirm flag.")
	}

	db, err := sql.Open("postgres", dsn)
	if err != nil {
		log.Fatalf("[Migrate CLI Error] Failed to connect: %v", err)
	}
	defer db.Close()

	if err := db.Ping(); err != nil {
		log.Fatalf("[Migrate CLI Error] Database ping failed: %v", err)
	}

	// Ensure schema_migrations table exists
	_, err = db.Exec(`
		CREATE TABLE IF NOT EXISTS schema_migrations (
			version VARCHAR(100) PRIMARY KEY,
			applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		);
	`)
	if err != nil {
		log.Fatalf("[Migrate CLI Error] Failed to create schema_migrations table: %v", err)
	}

	appliedVersions, err := getAppliedVersions(db)
	if err != nil {
		log.Fatalf("[Migrate CLI Error] Failed to get applied versions: %v", err)
	}

	upMigrations, downMigrations, err := loadMigrationFiles(migrationsDir)
	if err != nil {
		log.Fatalf("[Migrate CLI Error] Failed to read migrations: %v", err)
	}

	switch command {
	case "status":
		fmt.Println("==================================================")
		fmt.Println("MIGRATION STATUS")
		fmt.Println("==================================================")
		for _, m := range upMigrations {
			status := "[PENDING]"
			if appliedVersions[m.Version] {
				status = "[APPLIED]"
			}
			fmt.Printf("%s %s (%s)\n", status, m.Version, m.Name)
		}
	case "version":
		latest := getLatestApplied(appliedVersions, upMigrations)
		fmt.Printf("Current Database Version: %s\n", latest)
	case "up":
		count := 0
		for _, m := range upMigrations {
			if !appliedVersions[m.Version] {
				fmt.Printf("Applying migration %s: %s...\n", m.Version, m.Name)
				content, err := os.ReadFile(m.Path)
				if err != nil {
					log.Fatalf("Failed to read migration %s: %v", m.Path, err)
				}

				tx, err := db.Begin()
				if err != nil {
					log.Fatalf("Failed to begin transaction: %v", err)
				}

				if _, err := tx.Exec(string(content)); err != nil {
					tx.Rollback()
					log.Fatalf("Migration %s failed: %v", m.Version, err)
				}

				if _, err := tx.Exec("INSERT INTO schema_migrations (version) VALUES ($1)", m.Version); err != nil {
					tx.Rollback()
					log.Fatalf("Failed to record migration %s: %v", m.Version, err)
				}

				if err := tx.Commit(); err != nil {
					log.Fatalf("Failed to commit transaction: %v", err)
				}

				fmt.Printf("Successfully applied %s\n", m.Version)
				count++
			}
		}
		if count == 0 {
			fmt.Println("Database is already up to date. No pending migrations.")
		} else {
			fmt.Printf("Applied %d migration(s) successfully.\n", count)
		}
	case "down":
		latest := getLatestApplied(appliedVersions, upMigrations)
		if latest == "" {
			fmt.Println("No applied migrations to rollback.")
			return
		}

		downFile, exists := downMigrations[latest]
		if !exists {
			log.Fatalf("No corresponding down migration found for version %s", latest)
		}

		fmt.Printf("Rolling back migration %s: %s...\n", latest, downFile.Name)
		content, err := os.ReadFile(downFile.Path)
		if err != nil {
			log.Fatalf("Failed to read down migration %s: %v", downFile.Path, err)
		}

		tx, err := db.Begin()
		if err != nil {
			log.Fatalf("Failed to begin transaction: %v", err)
		}

		if _, err := tx.Exec(string(content)); err != nil {
			tx.Rollback()
			log.Fatalf("Rollback of %s failed: %v", latest, err)
		}

		if _, err := tx.Exec("DELETE FROM schema_migrations WHERE version = $1", latest); err != nil {
			tx.Rollback()
			log.Fatalf("Failed to remove migration record %s: %v", latest, err)
		}

		if err := tx.Commit(); err != nil {
			log.Fatalf("Failed to commit rollback: %v", err)
		}

		fmt.Printf("Successfully rolled back migration %s\n", latest)
	default:
		log.Fatalf("Unknown command: %s. Use up, down, status, or version.", command)
	}
}

func getAppliedVersions(db *sql.DB) (map[string]bool, error) {
	rows, err := db.Query("SELECT version FROM schema_migrations ORDER BY applied_at ASC")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	applied := make(map[string]bool)
	for rows.Next() {
		var v string
		if err := rows.Scan(&v); err != nil {
			return nil, err
		}
		applied[v] = true
	}
	return applied, nil
}

func loadMigrationFiles(dir string) ([]MigrationFile, map[string]MigrationFile, error) {
	entries, err := os.ReadDir(dir)
	if err != nil {
		return nil, nil, err
	}

	var upList []MigrationFile
	downMap := make(map[string]MigrationFile)

	for _, e := range entries {
		if e.IsDir() {
			continue
		}
		name := e.Name()
		if strings.HasSuffix(name, ".up.sql") {
			parts := strings.Split(name, "_")
			version := parts[0]
			upList = append(upList, MigrationFile{
				Version: version,
				Name:    name,
				Type:    "up",
				Path:    filepath.Join(dir, name),
			})
		} else if strings.HasSuffix(name, ".down.sql") {
			parts := strings.Split(name, "_")
			version := parts[0]
			downMap[version] = MigrationFile{
				Version: version,
				Name:    name,
				Type:    "down",
				Path:    filepath.Join(dir, name),
			}
		}
	}

	sort.Slice(upList, func(i, j int) bool {
		return upList[i].Version < upList[j].Version
	})

	return upList, downMap, nil
}

func getLatestApplied(applied map[string]bool, upList []MigrationFile) string {
	var latest string
	for _, m := range upList {
		if applied[m.Version] {
			latest = m.Version
		}
	}
	return latest
}
