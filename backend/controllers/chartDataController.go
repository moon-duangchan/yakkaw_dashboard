package controllers

import (
	"fmt"
	"net/http"
	"strconv"
	"time"

	"yakkaw_dashboard/cache"
	"yakkaw_dashboard/models"
	"yakkaw_dashboard/services"

	"github.com/labstack/echo/v4"
)

type ChartDataController struct{}

func NewChartDataController() *ChartDataController {
	return &ChartDataController{}
}

var ()

func (ctl *ChartDataController) GetChartDataHandler(c echo.Context) error {
	rangeType := c.QueryParam("range")
	if rangeType == "" {
		rangeType = "24 Hour" // ค่า default
	}
	// รับค่า province จาก query parameter
	province := c.QueryParam("province")
	metric := c.QueryParam("metric")
	if metric == "" {
		metric = "pm25"
	}

	cacheKey := fmt.Sprintf("chart:data:%s:%s:%s", rangeType, province, metric)
	var cached models.ChartData
	if ok, err := cache.GetJSON(cacheKey, &cached); err == nil && ok {
		return c.JSON(http.StatusOK, cached)
	}

	chartData, err := services.GetChartData(rangeType, province, metric)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	_ = cache.SetJSON(cacheKey, chartData, chartDataTTL(rangeType))
	return c.JSON(http.StatusOK, chartData)
}

// GetTodayChartDataHandler ดึงข้อมูล chart ของวันนี้ (ตั้งแต่เที่ยงคืนถึงเวลาปัจจุบัน)
func (ctl *ChartDataController) GetTodayChartDataHandler(c echo.Context) error {
	// รับค่า province จาก query parameter
	province := c.QueryParam("province")
	metric := c.QueryParam("metric")
	if metric == "" {
		metric = "pm25"
	}
	cacheKey := fmt.Sprintf("chart:data:Today:%s:%s", province, metric)
	var cached models.ChartData
	if ok, err := cache.GetJSON(cacheKey, &cached); err == nil && ok {
		return c.JSON(http.StatusOK, cached)
	}

	chartData, err := services.GetChartData("Today", province, metric)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	_ = cache.SetJSON(cacheKey, chartData, chartDataTTL("Today"))
	return c.JSON(http.StatusOK, chartData)
}

// GetHeatmapOneYearHandler returns daily PM2.5 averages for the last 12 months for a given province
func (ctl *ChartDataController) GetHeatmapOneYearHandler(c echo.Context) error {
	province := c.QueryParam("province")
	if province == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "province is required"})
	}
	metric := c.QueryParam("metric")
	if metric == "" {
		metric = "pm25"
	}
	cacheKey := fmt.Sprintf("chart:heatmap:1y:%s:%s", province, metric)
	var cached models.ChartData
	if ok, err := cache.GetJSON(cacheKey, &cached); err == nil && ok {
		return c.JSON(http.StatusOK, cached)
	}

	chartData, err := services.GetHeatmapOneYearDaily(province, metric)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	_ = cache.SetJSON(cacheKey, chartData, 6*time.Hour)
	return c.JSON(http.StatusOK, chartData)
}

// ranking
func (ctl *ChartDataController) GetDailyRankingHandler(c echo.Context) error {
	metric := c.QueryParam("metric")
	if metric == "" {
		metric = "pm25"
	}

	// group: address | place | province (default: address)
	group := c.QueryParam("group")
	if group == "" {
		group = "address"
	}

	// date (YYYY-MM-DD), default = วันนี้ตาม Asia/Bangkok
	loc, _ := time.LoadLocation("Asia/Bangkok")
	dateStr := c.QueryParam("date")
	if dateStr == "" {
		dateStr = time.Now().In(loc).Format("2006-01-02")
	}

	// limit (1..100), default 10
	limit := 10
	if ls := c.QueryParam("limit"); ls != "" {
		if v, err := strconv.Atoi(ls); err == nil {
			if v < 1 {
				v = 1
			}
			if v > 100 {
				v = 100
			}
			limit = v
		}
	}

	cacheKey := fmt.Sprintf("chart:rank:%s:%s:%s:%d", dateStr, metric, group, limit)
	var cached []services.DailyRankRow
	if ok, err := cache.GetJSON(cacheKey, &cached); err == nil && ok {
		return c.JSON(http.StatusOK, cached)
	}

	// เรียก service แบบ group-able
	ranking, err := services.GetDailyRankingGrouped(dateStr, metric, group, limit)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	_ = cache.SetJSON(cacheKey, ranking, 30*time.Minute)
	return c.JSON(http.StatusOK, ranking)
}

func chartDataTTL(rangeType string) time.Duration {
	switch rangeType {
	case "Today", "24 Hour":
		return 30 * time.Second
	case "1 Week":
		return time.Minute
	case "1 Month":
		return 3 * time.Minute
	case "3 Month", "1 Year":
		return 10 * time.Minute
	default:
		return 30 * time.Second
	}
}
