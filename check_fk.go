package main
import (
	"fmt"
	"log"
	"jadwal-api/core/database"
	"github.com/joho/godotenv"
)
func main() {
	godotenv.Load()
	database.Connect()
	rows, err := database.DB.Query(`
		SELECT
			tc.table_name, kcu.column_name,
			ccu.table_name AS foreign_table_name,
			ccu.column_name AS foreign_column_name,
			rc.delete_rule
		FROM information_schema.table_constraints tc
		JOIN information_schema.key_column_usage kcu
		  ON tc.constraint_name = kcu.constraint_name
		JOIN information_schema.referential_constraints rc
		  ON tc.constraint_name = rc.constraint_name
		JOIN information_schema.constraint_column_usage ccu
		  ON ccu.constraint_name = tc.constraint_name
		WHERE constraint_type = 'FOREIGN KEY';
	`)
	if err != nil { log.Fatal(err) }
	for rows.Next() {
		var table, col, ftable, fcol, rule string
		rows.Scan(&table, &col, &ftable, &fcol, &rule)
		fmt.Printf("%s.%s -> %s.%s (%s)\n", table, col, ftable, fcol, rule)
	}
}
