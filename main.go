package main

import (
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware" 
	"yakkaw_dashboard/database"
	"yakkaw_dashboard/routes"
	"yakkaw_dashboard/utils"
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
        AllowOrigins: []string{"http://localhost:3000"}, // Allow only frontend's domain
        AllowMethods: []string{echo.GET, echo.POST, echo.PUT, echo.DELETE},
        AllowHeaders: []string{echo.HeaderContentType, echo.HeaderAuthorization},
        AllowCredentials: true,
    }))

    // Set up routes
    routes.Init(e)

    // Start the server
    e.Logger.Fatal(e.Start(":8080"))
}

