package controllers

import (
	"net/http"

	"yakkaw_dashboard/services"

	"github.com/labstack/echo/v4"
)

type ChartDataController struct{}

func NewChartDataController() *ChartDataController {
	return &ChartDataController{}
}

func (ctl *ChartDataController) GetChartDataHandler(c echo.Context) error {
	rangeType := c.QueryParam("range")
	if rangeType == "" {
		rangeType = "24 Hour" // ค่า default
	}
	// รับค่า province จาก query parameter
	province := c.QueryParam("province")

	chartData, err := services.GetChartData(rangeType, province)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, chartData)
}

// GetTodayChartDataHandler ดึงข้อมูล chart ของวันนี้ (ตั้งแต่เที่ยงคืนถึงเวลาปัจจุบัน)
func (ctl *ChartDataController) GetTodayChartDataHandler(c echo.Context) error {
	// รับค่า province จาก query parameter
	province := c.QueryParam("province")

	chartData, err := services.GetChartData("Today", province)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, chartData)
}
