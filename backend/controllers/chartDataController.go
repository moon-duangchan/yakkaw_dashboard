package controllers

import (
    "net/http"
    "sync"
    "time"

    "yakkaw_dashboard/services"

    "github.com/labstack/echo/v4"
)

type ChartDataController struct{}

func NewChartDataController() *ChartDataController {
    return &ChartDataController{}
}

var (
    chartCache sync.Map // key: "range|province" -> struct{ at time.Time; data interface{} }
)

func (ctl *ChartDataController) GetChartDataHandler(c echo.Context) error {
    rangeType := c.QueryParam("range")
    if rangeType == "" {
        rangeType = "24 Hour" // ค่า default
    }
    // รับค่า province จาก query parameter
    province := c.QueryParam("province")
    metric := c.QueryParam("metric")
    if metric == "" { metric = "pm25" }

    // Short-lived cache (30s) to reduce repeated heavy queries
    cacheKey := rangeType + "|" + province + "|" + metric
    if v, ok := chartCache.Load(cacheKey); ok {
        if rec, ok2 := v.(struct{ at time.Time; data interface{} }); ok2 {
            if time.Since(rec.at) < 30*time.Second {
                return c.JSON(http.StatusOK, rec.data)
            }
        }
    }

    chartData, err := services.GetChartData(rangeType, province, metric)
    if err != nil {
        return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
    }
    chartCache.Store(cacheKey, struct{ at time.Time; data interface{} }{at: time.Now(), data: chartData})
    return c.JSON(http.StatusOK, chartData)
}

// GetTodayChartDataHandler ดึงข้อมูล chart ของวันนี้ (ตั้งแต่เที่ยงคืนถึงเวลาปัจจุบัน)
func (ctl *ChartDataController) GetTodayChartDataHandler(c echo.Context) error {
    // รับค่า province จาก query parameter
    province := c.QueryParam("province")
    metric := c.QueryParam("metric")
    if metric == "" { metric = "pm25" }
    cacheKey := "Today|" + province + "|" + metric
    if v, ok := chartCache.Load(cacheKey); ok {
        if rec, ok2 := v.(struct{ at time.Time; data interface{} }); ok2 {
            if time.Since(rec.at) < 30*time.Second {
                return c.JSON(http.StatusOK, rec.data)
            }
        }
    }

    chartData, err := services.GetChartData("Today", province, metric)
    if err != nil {
        return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
    }
    chartCache.Store(cacheKey, struct{ at time.Time; data interface{} }{at: time.Now(), data: chartData})
    return c.JSON(http.StatusOK, chartData)
}

// GetHeatmapOneYearHandler returns daily PM2.5 averages for the last 12 months for a given province
func (ctl *ChartDataController) GetHeatmapOneYearHandler(c echo.Context) error {
    province := c.QueryParam("province")
    if province == "" {
        return c.JSON(http.StatusBadRequest, map[string]string{"error": "province is required"})
    }
    metric := c.QueryParam("metric")
    if metric == "" { metric = "pm25" }
    cacheKey := "HeatmapOneYear|" + province + "|" + metric
    if v, ok := chartCache.Load(cacheKey); ok {
        if rec, ok2 := v.(struct{ at time.Time; data interface{} }); ok2 {
            if time.Since(rec.at) < 30*time.Second {
                return c.JSON(http.StatusOK, rec.data)
            }
        }
    }

    chartData, err := services.GetHeatmapOneYearDaily(province, metric)
    if err != nil {
        return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
    }
    chartCache.Store(cacheKey, struct{ at time.Time; data interface{} }{at: time.Now(), data: chartData})
    return c.JSON(http.StatusOK, chartData)
}
