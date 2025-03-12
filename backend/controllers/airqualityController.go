package controllers

import (
    "net/http"

    "github.com/labstack/echo/v4"

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
