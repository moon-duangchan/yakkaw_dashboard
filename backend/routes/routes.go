package routes

import (
	"github.com/labstack/echo/v4"
	"yakkaw_dashboard/controllers"
	"yakkaw_dashboard/database"
	"yakkaw_dashboard/middleware"
	"yakkaw_dashboard/services"
)

func Init(e *echo.Echo) {
	// Public Routes
	e.POST("/register", controllers.Register)
	e.POST("/login", controllers.Login)
	e.POST("/logout", controllers.Logout)

	// Instantiate services using the database connection
	categoryService := services.NewCategoryService(database.DB)
	newsService := services.NewNewsService(database.DB)

	// Create controllers by injecting the corresponding service
	categoryController := controllers.NewCategoryController(categoryService)
	newsController := controllers.NewNewsController(newsService)

	// Public routes for reading categories and news
	e.GET("/categories", categoryController.GetCategories)
	e.GET("/categories/:id", categoryController.GetCategoryByID)
	e.GET("/news", newsController.GetNews)
	e.GET("/news/:id", newsController.GetNewsByID)

	// Protected Admin Routes
	adminGroup := e.Group("/admin")
	adminGroup.Use(middleware.JWTMiddleware) // Protect all admin routes

	// Admin-only 
	adminGroup.POST("/categories", categoryController.CreateCategory)
	adminGroup.POST("/news", newsController.CreateNews)
	adminGroup.GET("/categories", categoryController.GetCategories)
	adminGroup.GET("/categories/:id", categoryController.GetCategoryByID)
	adminGroup.GET("/news", newsController.GetNews)
	adminGroup.GET("/news/:id", newsController.GetNewsByID)
	adminGroup.DELETE("/categories/:id", categoryController.DeleteCategory)
	adminGroup.DELETE("/news/:id", newsController.DeleteNews)
	adminGroup.GET("/dashboard", controllers.AdminDashboard)
	adminGroup.POST("/notifications", controllers.CreateNotification)
	adminGroup.PUT("/notifications/:id", controllers.UpdateNotification)
	adminGroup.DELETE("/notifications/:id", controllers.DeleteNotification)

	// Sponsor management (admin only)
	sponsorGroup := e.Group("/admin/sponsors")
	sponsorGroup.Use(middleware.JWTMiddleware)
	sponsorGroup.POST("", controllers.CreateSponsor)
	sponsorGroup.PUT("/:id", controllers.UpdateSponsor)
	sponsorGroup.DELETE("/:id", controllers.DeleteSponsor)

	// Public route for sponsors
	e.GET("/sponsors", controllers.GetSponsors)

	// Public route for notifications
	e.GET("/notifications", controllers.GetNotifications)

	// Public route for user info
	e.GET("/me", controllers.Me)

	// AirQualityController routes
	airCtl := controllers.NewAirQualityController()
	e.GET("/api/airquality/one_week", airCtl.GetOneWeekDataHandler)
	e.GET("/api/airquality/one_month", airCtl.GetOneMonthDataHandler)
	e.GET("/api/airquality/three_months", airCtl.GetThreeMonthsDataHandler)
	e.GET("/api/airquality/one_year", airCtl.GetOneYearDataHandler)

	chartDataController := controllers.NewChartDataController()
	e.GET("/api/chartdata", chartDataController.GetChartDataHandler)

	e.GET("/api/airquality/latest", controllers.GetLatestAirQuality)
}
