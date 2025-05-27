package controllers

import (
	"net/http"
	"yakkaw_dashboard/models"
	"yakkaw_dashboard/services"

	"github.com/labstack/echo/v4"
)

type ColorRangeController struct{}

func (ctrl *ColorRangeController) Create(c echo.Context) error {
	var input models.ColorRange
	if err := c.Bind(&input); err != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{"error": "Invalid input"})
	}

	data, err := services.CreateColorRange(input)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": "Failed to create"})
	}

	return c.JSON(http.StatusCreated, data)
}

func (ctrl *ColorRangeController) GetAll(c echo.Context) error {
	data, err := services.GetAllColorRanges()
	if err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": "Failed to fetch data"})
	}
	return c.JSON(http.StatusOK, data)
}

func (ctrl *ColorRangeController) GetByID(c echo.Context) error {
	id := c.Param("id")
	data, err := services.GetColorRange(id)
	if err != nil {
		return c.JSON(http.StatusNotFound, echo.Map{"error": "Not found"})
	}
	return c.JSON(http.StatusOK, data)
}

func (ctrl *ColorRangeController) Update(c echo.Context) error {
	id := c.Param("id")
	var input models.ColorRange
	if err := c.Bind(&input); err != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{"error": "Invalid input"})
	}

	data, err := services.UpdateColorRange(id, input)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": "Update failed"})
	}
	return c.JSON(http.StatusOK, data)
}

func (ctrl *ColorRangeController) Delete(c echo.Context) error {
	id := c.Param("id")
	if err := services.DeleteColorRange(id); err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": "Delete failed"})
	}
	return c.JSON(http.StatusOK, echo.Map{"message": "Deleted successfully"})
}
