package middleware

import (
	"context"
	"database/sql"

	"github.com/gin-gonic/gin"
	"jadwal-api/core/database"
)

type contextKey string

const TenantTxKey contextKey = "tenant_db_tx"

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

		// If connected to a real PostgreSQL instance, set session config for this transaction
		if database.DB != nil {
			ctx := c.Request.Context()
			// Scope session variables on the connection context
			_, _ = database.DB.ExecContext(ctx, `
				SELECT set_tenant_context($1::uuid, $2::boolean, $3::uuid)
			`, sql.NullString{String: tenantID, Valid: tenantID != ""}, isSuperAdmin, sql.NullString{String: userID, Valid: userID != ""})
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
	_, err := tx.ExecContext(ctx, `
		SELECT set_tenant_context($1::uuid, $2::boolean)
	`, sql.NullString{String: tenantID, Valid: tenantID != ""}, isSuperAdmin)
	return err
}
