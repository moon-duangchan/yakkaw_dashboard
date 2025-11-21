package controllers

import (
	"fmt"
	"net/http"
	"time"

	"yakkaw_dashboard/cache"
	"yakkaw_dashboard/services"

	"github.com/labstack/echo/v4"
)

func GetPlaces(c echo.Context) error {
	province := c.QueryParam("province")
	cacheKey := fmt.Sprintf("places:%s", province)

	var cached []services.PlaceItem
	if ok, err := cache.GetJSON(cacheKey, &cached); err == nil && ok {
		return c.JSON(http.StatusOK, cached)
	}

	places, err := services.GetDistinctPlaces(province)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	_ = cache.SetJSON(cacheKey, places, 30*time.Minute)
	return c.JSON(http.StatusOK, places)
}
