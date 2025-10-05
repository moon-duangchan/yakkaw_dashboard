package controllers

import (
    "net/http"
    "sync"
    "time"
    "yakkaw_dashboard/services"
    "github.com/labstack/echo/v4"
)

// GetPlaces returns distinct places from sensor_data, optionally filtered by province
var placesCache sync.Map // key: "places|province" -> struct{ at time.Time; data interface{} }

func GetPlaces(c echo.Context) error {
    province := c.QueryParam("province")
    cacheKey := "places|" + province
    if v, ok := placesCache.Load(cacheKey); ok {
        if rec, ok2 := v.(struct{ at time.Time; data interface{} }); ok2 {
            if time.Since(rec.at) < 5*time.Minute {
                return c.JSON(http.StatusOK, rec.data)
            }
        }
    }

    places, err := services.GetDistinctPlaces(province)
    if err != nil {
        return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
    }
    placesCache.Store(cacheKey, struct{ at time.Time; data interface{} }{at: time.Now(), data: places})
    return c.JSON(http.StatusOK, places)
}
