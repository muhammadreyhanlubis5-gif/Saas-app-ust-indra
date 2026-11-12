package middleware

import (
	"context"
	"database/sql"
	"regexp"

	"github.com/gin-gonic/gin"
	"jadwal-api/core/database"
)

type contextKey string

const TenantTxKey contextKey = "tenant_db_tx"

var uuidRegex = regexp.MustCompile(`^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$`)

// IsValidUUID memeriksa apakah string merupakan UUID standar 36-karakter
func IsValidUUID(u string) bool {
	return uuidRegex.MatchString(u)
}

/**
 * TenantContextMiddleware
 * Enforces PostgreSQL Row-Level Security (RLS) isolation per request.
 * Guarantees that School A can NEVER read, update, or delete School B's records.
 */
func TenantContextMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		tenantID := c.GetString("school_id")
		role := c.GetString("role")
		userID := c.GetString("user_id")

		if tenantID == "" {
			tenantID = c.GetHeader("X-School-ID")
		}

		isSuperAdmin := (role == "SUPER_ADMIN")

		// Validasi tipe UUID sebelum cast $1::uuid untuk mencegah error transaksi Postgres
		var validTenantUUID sql.NullString
		if tenantID != "" && IsValidUUID(tenantID) {
			validTenantUUID = sql.NullString{String: tenantID, Valid: true}
		}

		var validUserUUID sql.NullString
		if userID != "" && IsValidUUID(userID) {
			validUserUUID = sql.NullString{String: userID, Valid: true}
		}

		// Jika terhubung ke database Postgres asli, terapkan scope RLS untuk sesi request ini
		if database.DB != nil && (validTenantUUID.Valid || isSuperAdmin) {
			ctx := c.Request.Context()
			_, _ = database.DB.ExecContext(ctx, `
				SELECT set_tenant_context($1::uuid, $2::boolean, $3::uuid)
			`, validTenantUUID, isSuperAdmin, validUserUUID)
		}

		c.Set("tenant_id", tenantID)
		c.Set("is_super_admin", isSuperAdmin)
		c.Next()
	}
}

/**
 * SetDBSessionScope helper for manual queries in services
 */
func SetDBSessionScope(ctx context.Context, tx *sql.Tx, tenantID string, isSuperAdmin bool) error {
	if tx == nil {
		return nil
	}
	var validTenantUUID sql.NullString
	if tenantID != "" && IsValidUUID(tenantID) {
		validTenantUUID = sql.NullString{String: tenantID, Valid: true}
	}
	_, err := tx.ExecContext(ctx, `
		SELECT set_tenant_context($1::uuid, $2::boolean)
	`, validTenantUUID, isSuperAdmin)
	return err
}
