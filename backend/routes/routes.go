package routes

import (
	"github.com/labstack/echo/v4"
	"yakkaw_dashboard/controllers"
	"yakkaw_dashboard/middleware"
)

func Init(e *echo.Echo) {
	// Public Routes
	e.POST("/register", controllers.Register)
	e.POST("/login", controllers.Login)
	e.POST("/logout", controllers.Logout)

	// Protected Admin Routes
	adminGroup := e.Group("/admin")
	adminGroup.Use(middleware.JWTMiddleware) // Protect all admin routes
	adminGroup.GET("/dashboard", controllers.AdminDashboard)
	adminGroup.POST("/notifications", controllers.CreateNotification)       // ✅ Admin only
	adminGroup.PUT("/notifications/:id", controllers.UpdateNotification)    // ✅ Admin only (New route for updating)
	adminGroup.DELETE("/notifications/:id", controllers.DeleteNotification) // ✅ Admin only

	// เพิ่ม Sponsor Management
	sponsorGroup := e.Group("/admin/sponsors")
	sponsorGroup.Use(middleware.JWTMiddleware)             // ป้องกันเฉพาะ admin
	sponsorGroup.POST("", controllers.CreateSponsor)       // สร้าง sponsor ใหม่
	sponsorGroup.PUT("/:id", controllers.UpdateSponsor)    // อัปเดต sponsor
	sponsorGroup.DELETE("/:id", controllers.DeleteSponsor) // ลบ sponsor

	// Public Route สำหรับดึง sponsor (ถ้าต้องการให้เปิดให้ทุกคน)
	e.GET("/sponsors", controllers.GetSponsors)

	// Public Route for users to fetch notifications
	e.GET("/notifications", controllers.GetNotifications) // ✅ Everyone can get notifications

	e.GET("/me", controllers.Me)

	// AirQualityController
	airCtl := controllers.NewAirQualityController()

	// เส้นทางสำหรับเรียกดูค่าเฉลี่ยฝุ่นในช่วงต่าง ๆ
	e.GET("/api/airquality/one_week", airCtl.GetOneWeekDataHandler)
	e.GET("/api/airquality/one_month", airCtl.GetOneMonthDataHandler)
	e.GET("/api/airquality/three_months", airCtl.GetThreeMonthsDataHandler)
	e.GET("/api/airquality/one_year", airCtl.GetOneYearDataHandler)

	chartDataController := controllers.NewChartDataController()
	e.GET("/api/chartdata", chartDataController.GetChartDataHandler)

	e.GET("/api/airquality/latest", controllers.GetLatestAirQuality)

}
