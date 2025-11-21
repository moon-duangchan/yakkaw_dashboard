package cache

import (
	"encoding/json"
	"errors"
	"time"

	"github.com/redis/go-redis/v9"
)

// GetJSON fetches a JSON value from Redis into dest. Returns ok=false on cache miss.
func GetJSON(key string, dest interface{}) (bool, error) {
	if Rdb == nil {
		return false, errors.New("redis client is not initialized")
	}
	val, err := Rdb.Get(Ctx, key).Result()
	if err != nil {
		if errors.Is(err, redis.Nil) {
			return false, nil
		}
		return false, err
	}
	if err := json.Unmarshal([]byte(val), dest); err != nil {
		return false, err
	}
	return true, nil
}

// SetJSON stores value as JSON with the provided TTL.
func SetJSON(key string, value interface{}, ttl time.Duration) error {
	if Rdb == nil {
		return errors.New("redis client is not initialized")
	}
	b, err := json.Marshal(value)
	if err != nil {
		return err
	}
	return Rdb.Set(Ctx, key, b, ttl).Err()
}
