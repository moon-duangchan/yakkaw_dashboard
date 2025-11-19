package routes

import (
	"yakkaw_dashboard/controllers"
	"yakkaw_dashboard/database"
	middleware "yakkaw_dashboard/middlewares"
	"yakkaw_dashboard/services"

	"github.com/labstack/echo/v4"
)

func Init(e *echo.Echo) {

	ctrl := new(controllers.ColorRangeController)

	e.GET("/colorranges", ctrl.GetAll)
	e.GET("/colorranges/:id", ctrl.GetByID)
	e.GET("/color-ranges", ctrl.GetAll)

	// Devices (READ public, WRITE admin)

	// Admin-only: Manage Devices & ColorRanges
	// adminGroup := e.Group("/admin")
	// adminGroup.Use(middleware.JWTMiddleware)

	//Devices
	e.GET("/devices", controllers.GetAllDevices)
	e.GET("/devices/:dvid", controllers.GetDevice)

	// 🔹 Public Authentication Routes
	e.POST("/login", controllers.Login)
	e.POST("/logout", controllers.Logout)

	// 🔹 Instantiate services using the database connection
	categoryService := services.NewCategoryService(database.DB)
	newsService := services.NewNewsService(database.DB)

	// 🔹 Create controllers by injecting the corresponding service
	categoryController := controllers.NewCategoryController(categoryService)
	newsController := controllers.NewNewsController(newsService)

	// 🔹 Public Routes for Categories and News (READ only)
	e.GET("/categories", categoryController.GetCategories)
	e.GET("/categories/:id", categoryController.GetCategoryByID)
	e.GET("/news", newsController.GetNews)
	e.GET("/news/:id", newsController.GetNewsByID)

	// 🔹 Protected Admin Routes
	adminGroup := e.Group("/admin")
	adminGroup.Use(middleware.JWTMiddleware) // Protect all admin routes

	// QR login: admin generates short-lived token
	adminGroup.POST("/qr/generate", controllers.GenerateQRLogin)

	adminGroup.POST("/devices", controllers.CreateDevice)
	adminGroup.PUT("/devices/:dvid", controllers.UpdateDevice)
	adminGroup.DELETE("/devices/:id", controllers.DeleteDevice)

	adminGroup.POST("/colorranges", ctrl.Create)
	adminGroup.PUT("/colorranges/:id", ctrl.Update)
	adminGroup.DELETE("/colorranges/:id", ctrl.Delete)

	// ✅ Admin-only: Manage Categories
	adminGroup.POST("/categories", categoryController.CreateCategory)
	adminGroup.PUT("/categories/:id", categoryController.UpdateCategory)
	adminGroup.DELETE("/categories/:id", categoryController.DeleteCategory)

	// ✅ Admin-only: Manage News
	adminGroup.POST("/news", newsController.CreateNews)
	adminGroup.PUT("/news/:id", newsController.UpdateNews)
	adminGroup.DELETE("/news/:id", newsController.DeleteNews)

	// ✅ Admin-only: Manage Dashboard & Notifications
	adminGroup.GET("/dashboard", controllers.AdminDashboard)
	adminGroup.POST("/notifications", controllers.CreateNotification)
	adminGroup.PUT("/notifications/:id", controllers.UpdateNotification)
	adminGroup.DELETE("/notifications/:id", controllers.DeleteNotification)

	// 🔹 Sponsor Management (Admin Only)
	sponsorGroup := e.Group("/admin/sponsors")
	sponsorGroup.Use(middleware.JWTMiddleware)
	sponsorGroup.POST("", controllers.CreateSponsor)
	sponsorGroup.PUT("/:id", controllers.UpdateSponsor)
	sponsorGroup.DELETE("/:id", controllers.DeleteSponsor)

	// 🔹 Public Routes for Sponsors and Notifications
	e.GET("/sponsors", controllers.GetSponsors)
	e.GET("/notifications", controllers.GetNotifications)
	e.GET("/me", controllers.Me)

	// 🔹 Places index (from sensor_data)
	e.GET("/places", controllers.GetPlaces)

	// 🔹 Pipeline controls (on-demand refresh)
	e.GET("/pipeline/refresh", controllers.PipelineRefresh)

	// 🔹 Air Quality Data Routes
	airCtl := controllers.NewAirQualityController()
	e.GET("/api/airquality/one_day", airCtl.GetOneDayDataHandler)
	e.GET("/api/airquality/one_week", airCtl.GetOneWeekDataHandler)
	e.GET("/api/airquality/one_month", airCtl.GetOneMonthDataHandler)
	e.GET("/api/airquality/three_months", airCtl.GetThreeMonthsDataHandler)
	e.GET("/api/airquality/one_year", airCtl.GetOneYearDataHandler)
	e.GET("/api/airquality/province_average", airCtl.GetProvinceAveragePM25Handler)
	e.GET("/api/airquality/sensor_data/week", airCtl.GetSensorData7DaysHandler)
	// heat air quality data
	e.GET("/api/airquality/one_year_series", controllers.GetAirQualityOneYearSeriesByAddress)
	// Heatmap by province (province query param optional: if missing => aggregate all)
	e.GET("/api/airquality/one_year_series_by_province", controllers.GetAirQualityOneYearSeriesByProvince)

	// 🔹 Chart Data Route
	chartDataController := controllers.NewChartDataController()
	e.GET("/api/chartdata", chartDataController.GetChartDataHandler)
	e.GET("/api/chartdata/today", chartDataController.GetTodayChartDataHandler)
	e.GET("/api/chartdata/heatmap_one_year", chartDataController.GetHeatmapOneYearHandler)

	// 🔹 Get Latest Air Quality
	e.GET("/api/airquality/latest", controllers.GetLatestAirQuality)

	// Public QR consume endpoint (sets cookie then redirects to frontend)
	e.GET("/qr/consume", controllers.ConsumeQRLogin)

	chartCtl := controllers.NewChartDataController()
	// ========== Chart Data ==========
	// ใช้สำหรับกราฟตามช่วงเวลา เช่น 24 ชั่วโมง / 7 วัน / 30 วัน / 1 ปี
	e.GET("/chart/data", chartCtl.GetChartDataHandler)

	// ดึงข้อมูลของ "วันนี้" (เที่ยงคืนถึงปัจจุบัน)
	e.GET("/chart/today", chartCtl.GetTodayChartDataHandler)

	// ดึงข้อมูล heatmap 1 ปี (รายวัน) ต่อจังหวัด
	e.GET("/chart/heatmap/year", chartCtl.GetHeatmapOneYearHandler)

	// ========== Ranking ==========
	// อันดับรายวัน สามารถจัดกลุ่มได้ด้วย ?group=address|place|province
	// ตัวอย่าง: /chart/ranking/daily?date=2025-10-27&metric=pm25&group=place&limit=10
	e.GET("/chart/ranking/daily", chartCtl.GetDailyRankingHandler)

}
