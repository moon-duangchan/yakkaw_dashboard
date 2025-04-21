package main

import (
	"os"
	"time"

	"yakkaw_dashboard/database"
	"yakkaw_dashboard/routes"
	"yakkaw_dashboard/services"
	"yakkaw_dashboard/utils"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func main() {
	// Initialize the Echo framework
	e := echo.New()

	// Set up logging
	utils.SetupLogger()

	// Initialize the database
	database.Init()

	// Enable CORS middleware to allow requests from the frontend
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins:     []string{"http://localhost:3000", "exp://*", "http://*"}, // Allow frontend and Expo
		AllowMethods:     []string{echo.GET, echo.POST, echo.PUT, echo.DELETE},
		AllowHeaders:     []string{echo.HeaderContentType, echo.HeaderAuthorization},
		AllowCredentials: true,
	}))

	// Set up routes
	routes.Init(e)

	// Start a goroutine for the data pipeline to fetch and store API data periodically.
	go func() {
		// รับค่า API_URL จาก environment variable หรือใช้ fallback ถ้าไม่มีค่า
		apiURL := os.Getenv("API_URL")
		if apiURL == "" {
			apiURL = "https://yakkaw.mfu.ac.th/api/yakkaw/devices" // เปลี่ยนเป็น URL ที่ถูกต้องของคุณ
		}
		for {
			services.FetchAndStoreData(apiURL)
			time.Sleep(5 * time.Minute)
		}
	}()

	// Start the server
	e.Logger.Fatal(e.Start(":8080"))
}
