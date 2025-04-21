package controllers

import (
	"net/http"
	"strconv"
	"yakkaw_dashboard/models"
	"yakkaw_dashboard/services"

	"github.com/labstack/echo/v4"
)

func CreateDevice(c echo.Context) error {
	var device models.Device
	if err := c.Bind(&device); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}

	createdDevice, err := services.CreateDevice(device)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, createdDevice)
}

func GetDevice(c echo.Context) error {
	dvid := c.Param("dvid")
	device, err := services.GetDeviceByDVID(dvid)
	if err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": "Device not found"})
	}

	return c.JSON(http.StatusOK, device)
}

func GetAllDevices(c echo.Context) error {
	devices, err := services.GetAllDevices()
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, devices)
}

func UpdateDevice(c echo.Context) error {
	dvid := c.Param("dvid")
	var device models.Device
	if err := c.Bind(&device); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}

	updatedDevice, err := services.UpdateDevice(dvid, device)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, updatedDevice)
}

func DeleteDevice(c echo.Context) error {
	// ดึง id จาก URL parameter
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid ID"})
	}

	// เรียกใช้ service เพื่อลบข้อมูล
	if err := services.DeleteDevice(uint(id)); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, map[string]string{"message": "Device deleted successfully"})
}

// func DeleteDevice(c echo.Context) error {
// 	dvid := c.Param("dv_id")
// 	if err := services.DeleteDevice(dvid); err != nil {
// 		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
// 	}

// 	return c.JSON(http.StatusOK, map[string]string{"message": "Device deleted successfully"})
// }

// func DeleteDevice(c echo.Context) error {
// 	dvid := c.Param("dvid")
// 	if err := services.DeleteDevice(dvid); err != nil {
// 		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
// 	}

// 	return c.JSON(http.StatusOK, map[string]string{"message": "Device deleted successfully"})
// }
