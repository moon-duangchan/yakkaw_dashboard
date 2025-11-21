package cache

import (
	"context"
	"fmt"

	"github.com/redis/go-redis/v9"
)

var Ctx = context.Background()
var Rdb *redis.Client

// InitRedis wires a singleton Redis client with the provided connection info.
func InitRedis(host, port, password string) error {
	addr := fmt.Sprintf("%s:%s", host, port)

	Rdb = redis.NewClient(&redis.Options{
		Addr:     addr,
		Password: password,
		DB:       0,
	})

	// Test connection eagerly so startup clearly fails if Redis is unreachable.
	if err := Rdb.Ping(Ctx).Err(); err != nil {
		return fmt.Errorf("redis ping failed: %w", err)
	}
	return nil
}
