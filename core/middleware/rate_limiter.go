package middleware

import (
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

type tokenBucket struct {
	tokens     float64
	capacity   float64
	refillRate float64 // tokens per second
	lastRefill time.Time
	lastAccess time.Time
}

type RateLimiter struct {
	mu      sync.RWMutex
	buckets map[string]*tokenBucket
	rate    float64 // refill rate (tokens / sec)
	burst   float64 // bucket capacity
}

var globalLimiter *RateLimiter
var onceLimiter sync.Once

func GetRateLimiter(rate float64, burst float64) *RateLimiter {
	onceLimiter.Do(func() {
		globalLimiter = &RateLimiter{
			buckets: make(map[string]*tokenBucket),
			rate:    rate,
			burst:   burst,
		}
		// Background janitor to sweep idle buckets and prevent memory leaks
		go globalLimiter.cleanupRoutine()
	})
	return globalLimiter
}

func (rl *RateLimiter) allow(key string) bool {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	now := time.Now()
	b, exists := rl.buckets[key]
	if !exists {
		b = &tokenBucket{
			tokens:     rl.burst - 1, // First request consumes 1
			capacity:   rl.burst,
			refillRate: rl.rate,
			lastRefill: now,
			lastAccess: now,
		}
		rl.buckets[key] = b
		return true
	}

	b.lastAccess = now
	// Calculate refilled tokens based on elapsed time
	elapsed := now.Sub(b.lastRefill).Seconds()
	b.tokens += elapsed * b.refillRate
	if b.tokens > b.capacity {
		b.tokens = b.capacity
	}
	b.lastRefill = now

	if b.tokens >= 1.0 {
		b.tokens -= 1.0
		return true
	}

	return false
}

func (rl *RateLimiter) cleanupRoutine() {
	ticker := time.NewTicker(5 * time.Minute)
	for range ticker.C {
		rl.mu.Lock()
		now := time.Now()
		for key, b := range rl.buckets {
			if now.Sub(b.lastAccess) > 10*time.Minute {
				delete(rl.buckets, key)
			}
		}
		rl.mu.Unlock()
	}
}

// NewCustomRateLimiter creates an independent rate limiter for sensitive endpoints like login
func NewCustomRateLimiter(rate float64, burst float64) gin.HandlerFunc {
	limiter := &RateLimiter{
		buckets: make(map[string]*tokenBucket),
		rate:    rate,
		burst:   burst,
	}
	go limiter.cleanupRoutine()

	return func(c *gin.Context) {
		key := c.ClientIP() + "_" + c.FullPath()
		if !limiter.allow(key) {
			c.Header("Retry-After", "5")
			c.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{
				"error":   "Too Many Requests",
				"message": "Terlalu banyak percobaan. Silakan tunggu beberapa saat sebelum mencoba kembali.",
				"code":    "RATE_LIMIT_EXCEEDED",
			})
			return
		}
		c.Next()
	}
}

/**
 * TokenBucketRateLimiter
 * Protects enterprise API endpoints from DDoS and brute-force attacks.
 * Scoped by client IP.
 */
func TokenBucketRateLimiter(rate float64, burst float64) gin.HandlerFunc {
	limiter := GetRateLimiter(rate, burst)

	return func(c *gin.Context) {
		key := c.ClientIP()

		if !limiter.allow(key) {
			c.Header("Retry-After", "1")
			c.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{
				"error":   "Too Many Requests",
				"message": "Batas frekuensi permintaan terlampaui. Silakan coba kembali sesaat lagi.",
				"code":    "RATE_LIMIT_EXCEEDED",
			})
			return
		}

		c.Next()
	}
}
