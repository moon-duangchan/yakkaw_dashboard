package controllers

import (
	"net/http"

	"github.com/labstack/echo/v4"

	"yakkaw_dashboard/database"
	"yakkaw_dashboard/services"
)

type AirQualityController struct{}

func NewAirQualityController() *AirQualityController {
	return &AirQualityController{}
}

// Handler สำหรับดึงค่าเฉลี่ย 1 สัปดาห์
func (ctl *AirQualityController) GetOneWeekDataHandler(c echo.Context) error {
	data, err := services.GetAirQualityOneWeek()
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, data)
}

// Handler สำหรับดึงค่าเฉลี่ย 1 เดือน
func (ctl *AirQualityController) GetOneMonthDataHandler(c echo.Context) error {
	data, err := services.GetAirQualityOneMonth()
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, data)
}

// Handler สำหรับดึงค่าเฉลี่ย 3 เดือน
func (ctl *AirQualityController) GetThreeMonthsDataHandler(c echo.Context) error {
	data, err := services.GetAirQualityThreeMonths()
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, data)
}

// Handler สำหรับดึงค่าเฉลี่ย 1 ปี
func (ctl *AirQualityController) GetOneYearDataHandler(c echo.Context) error {
	data, err := services.GetAirQualityOneYear()
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, data)
}

// GetLatestAirQuality ดึงค่า AQI และ timestamp ล่าสุดสำหรับจังหวัดที่ระบุ
func GetLatestAirQuality(c echo.Context) error {
	province := c.QueryParam("province")
	var result struct {
		AQI       int   `json:"aqi"`
		Timestamp int64 `json:"timestamp"`
	}

	// สร้าง query สำหรับดึง record ล่าสุดจาก sensor_data โดยกรองด้วย address ที่มีชื่อจังหวัด
	query := "SELECT aqi, timestamp FROM sensor_data WHERE 1=1"
	args := []interface{}{}
	if province != "" {
		query += " AND address ILIKE ?"
		args = append(args, "%"+province+"%")
	}
	query += " ORDER BY timestamp DESC LIMIT 1"

	row := database.DB.Raw(query, args...).Row()
	if err := row.Scan(&result.AQI, &result.Timestamp); err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"message": "Not Found"})
	}

	return c.JSON(http.StatusOK, result)
}

// GetProvinceAveragePM25Handler ดึงค่าเฉลี่ย PM2.5 ของแต่ละจังหวัด
func (ctl *AirQualityController) GetProvinceAveragePM25Handler(c echo.Context) error {
	data, err := services.GetProvinceAveragePM25()
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, data)
}

// GetSensorData7DaysHandler ดึงข้อมูล sensor_data ย้อนหลัง 7 วัน
func (ctl *AirQualityController) GetSensorData7DaysHandler(c echo.Context) error {
	data, err := services.GetSensorData7Days()
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, data)
}
