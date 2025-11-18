package main

import (
	"net/http"
	"sync"
	"time"

	"yakkaw_dashboard/config"
	"yakkaw_dashboard/database"
	"yakkaw_dashboard/routes"
	"yakkaw_dashboard/services"
	"yakkaw_dashboard/utils"

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
	cfg := config.Get()

	// Initialize the Echo framework
	e := echo.New()

	// Set up logging
	utils.SetupLogger()

	// Initialize the database
	database.Init()

	// Enable CORS middleware (ของ Echo ต้องเรียกผ่าน echomw)
	e.Use(echomw.CORSWithConfig(echomw.CORSConfig{
		AllowOrigins:     cfg.AllowedOrigins, 
		AllowMethods:     []string{http.MethodGet, http.MethodPost, http.MethodPut, http.MethodPatch, http.MethodDelete, http.MethodOptions},
		AllowHeaders:     []string{echo.HeaderOrigin, echo.HeaderContentType, echo.HeaderAccept, echo.HeaderXRequestedWith, echo.HeaderAuthorization},
		AllowCredentials: true,
	}))

	e.OPTIONS("/*", func(c echo.Context) error {
		return c.NoContent(http.StatusNoContent)
	})

	// Set up routes
	routes.Init(e)

	// Start a goroutine for the data pipeline to fetch and store API data periodically.
	go func(apiURL string) {
		for {
			services.FetchAndStoreData(apiURL)
			time.Sleep(5 * time.Minute)
		}
	}(cfg.DevicesAPIURL)

	// Start the server
	e.Logger.Fatal(e.Start(":" + cfg.ServerPort))
}
