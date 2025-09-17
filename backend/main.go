package main

import (
	"os"
	"time"
	"sync"

	"yakkaw_dashboard/routes"
	"yakkaw_dashboard/services"
	"yakkaw_dashboard/utils"
	"yakkaw_dashboard/database"

	"github.com/labstack/echo/v4"
	echomw "github.com/labstack/echo/v4/middleware" // 👈 ของ Echo ตั้ง alias เป็น echomw
)

type CacheItem struct {
	Data      any
	ExpiresAt time.Time
}

var (
	cache   = make(map[string]CacheItem)
	cacheMu sync.Mutex
)

func main() {
	// Initialize the Echo framework
	e := echo.New()

	// Set up logging
	utils.SetupLogger()

	// Initialize the database
	database.Init()

	// Enable CORS middleware (ของ Echo ต้องเรียกผ่าน echomw)
	e.Use(echomw.CORSWithConfig(echomw.CORSConfig{
		AllowOrigins:     []string{"http://localhost:3000", "exp://*", "http://*"}, // Allow frontend and Expo
		AllowMethods:     []string{echo.GET, echo.POST, echo.PUT, echo.DELETE},
		AllowHeaders:     []string{echo.HeaderContentType, echo.HeaderAuthorization},
		AllowCredentials: true,
	}))

	// Set up routes
	routes.Init(e)

	// Start a goroutine for the data pipeline to fetch and store API data periodically.
	go func() {
		apiURL := os.Getenv("API_URL")
		if apiURL == "" {
			apiURL = "https://yakkaw.mfu.ac.th/api/yakkaw/devices"
		}
		for {
			services.FetchAndStoreData(apiURL)
			time.Sleep(5 * time.Minute)
		}
	}()

	// Start the server
	e.Logger.Fatal(e.Start(":8080"))
}
