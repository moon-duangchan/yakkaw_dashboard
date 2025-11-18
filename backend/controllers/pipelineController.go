package controllers

import (
	"net/http"

	"github.com/labstack/echo/v4"

	"yakkaw_dashboard/config"
	"yakkaw_dashboard/services"
)

// PipelineRefresh triggers an on-demand fetch from the devices API and upserts into sensor_data
func PipelineRefresh(c echo.Context) error {
	apiURL := c.QueryParam("api_url")
	if apiURL == "" {
		apiURL = config.Get().DevicesAPIURL
	}

	processed, err := services.FetchAndStoreDevices(apiURL)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"error":     err.Error(),
			"api_url":   apiURL,
			"processed": processed,
		})
	}
	return c.JSON(http.StatusOK, map[string]interface{}{
		"message":   "refresh complete",
		"api_url":   apiURL,
		"processed": processed,
	})
}
