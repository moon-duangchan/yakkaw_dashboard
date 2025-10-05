package database

import (
	"fmt"
	"log"
	"os"

	"yakkaw_dashboard/models"

	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB
var err error

// Init initializes the database connection using environment variables
func Init() {
	// Load .env file
    // Load .env if present; do not fail if missing
    _ = godotenv.Load()

	// Get database connection details from environment variables
	dbHost := os.Getenv("DB_HOST")
	dbUser := os.Getenv("DB_USER")
	dbPassword := os.Getenv("DB_PASSWORD")
	dbName := os.Getenv("DB_NAME")
	dbPort := os.Getenv("DB_PORT")

	// Build the connection string
	dsn := fmt.Sprintf("host=%s user=%s dbname=%s password=%s port=%s sslmode=disable", dbHost, dbUser, dbName, dbPassword, dbPort)

	// Connect to the database
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("failed to connect to database: %v", err)
	}

	DB.AutoMigrate(&models.Notification{}, &models.User{}, &models.Sponsor{}, &models.SensorData{}, &models.APIResponse{}, &models.ChartData{}, models.DatasetChart{}, &models.Category{}, &models.News{}, &models.Device{}, &models.ColorRange{})
	fmt.Println("Database connection successfully established and migrations applied")
}
