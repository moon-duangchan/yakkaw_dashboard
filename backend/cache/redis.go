package cache

import (
	"context"
	"os"

	"github.com/redis/go-redis/v9"
)

var Ctx = context.Background()
var Rdb *redis.Client

func InitRedis() {
	dbHost := os.Getenv("REDIS_HOST")     // เช่น "localhost"
	dbPort := os.Getenv("REDIS_PORT")     // เช่น "6379"
	dbPassword := os.Getenv("REDIS_PASS") // ถ้าไม่มี password ให้เว้นว่าง ""

	addr := dbHost + ":" + dbPort

	Rdb = redis.NewClient(&redis.Options{
		Addr:     addr,
		Password: dbPassword,
		DB:       0,
	})

	// ทดสอบ connection
	if err := Rdb.Ping(Ctx).Err(); err != nil {
		panic("❌ Redis connection failed: " + err.Error())
	}
}
