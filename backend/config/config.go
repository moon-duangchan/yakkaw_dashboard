package config

import (
	"log"
	"os"
	"strings"
	"sync"

	"github.com/joho/godotenv"
)

// Config centralizes environment-driven settings that are required both at
// startup and within handlers/middleware.
type Config struct {
	ServerPort        string
	AllowedOrigins    []string
	DevicesAPIURL     string
	JWTSecret         string
	QRConsumeBaseURL  string
	QRDefaultRedirect string
	RedisHost         string
	RedisPort         string
	RedisPassword     string
}

var (
	cfg  *Config
	once sync.Once
)

// Get returns a singleton configuration instance populated from environment
// variables (with minimal local defaults for developer ergonomics).
func Get() *Config {
	once.Do(func() {
		_ = godotenv.Load()

		serverPort := firstNonEmpty(os.Getenv("SERVER_PORT"), os.Getenv("PORT"))
		if serverPort == "" {
			serverPort = "8080"
		}

		cfg = &Config{
			ServerPort:        serverPort,
			AllowedOrigins:    buildOrigins(getEnv("FRONTEND_ORIGINS", "http://localhost:3000")),
			DevicesAPIURL:     getRequiredEnv("API_URL"),
			JWTSecret:         getRequiredEnv("JWT_SECRET"),
			QRConsumeBaseURL:  getEnv("QR_CONSUME_BASE_URL", "http://localhost:8080"),
			QRDefaultRedirect: getEnv("QR_DEFAULT_REDIRECT", "http://localhost:3000/qr-create-device"),
			RedisHost:         getEnv("REDIS_HOST", "localhost"),
			RedisPort:         getEnv("REDIS_PORT", "6379"),
			RedisPassword:     getEnv("REDIS_PASS", ""),
		}
	})

	return cfg
}

func getEnv(key, fallback string) string {
	value := strings.TrimSpace(os.Getenv(key))
	if value != "" {
		return value
	}
	return fallback
}

func getRequiredEnv(key string) string {
	value := strings.TrimSpace(os.Getenv(key))
	if value == "" {
		log.Fatalf("%s must be set", key)
	}
	return value
}

func buildOrigins(origins string) []string {
	items := splitAndTrim(origins)
	if len(items) == 0 {
		items = []string{"http://localhost:3000"}
	}
	return uniqueStrings(items)
}

func splitAndTrim(origins string) []string {
	if origins == "" {
		return nil
	}
	parts := strings.Split(origins, ",")
	filtered := make([]string, 0, len(parts))
	for _, origin := range parts {
		if trimmed := strings.TrimSpace(origin); trimmed != "" {
			filtered = append(filtered, trimmed)
		}
	}
	return filtered
}

func uniqueStrings(values []string) []string {
	seen := make(map[string]struct{}, len(values))
	result := make([]string, 0, len(values))
	for _, value := range values {
		if _, ok := seen[value]; ok {
			continue
		}
		seen[value] = struct{}{}
		result = append(result, value)
	}
	return result
}

func firstNonEmpty(values ...string) string {
	for _, value := range values {
		if strings.TrimSpace(value) != "" {
			return strings.TrimSpace(value)
		}
	}
	return ""
}
