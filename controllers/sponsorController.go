package controllers

import (
	"net/http"
	"strconv"
	"yakkaw_dashboard/database"
	"yakkaw_dashboard/models"

	"github.com/labstack/echo/v4"
	"gorm.io/gorm"
)

// CreateSponsor - สร้าง sponsor ใหม่ (เฉพาะ admin)
func CreateSponsor(c echo.Context) error {
	userRole := c.Get("userRole")
	if userRole != "admin" {
		return c.JSON(http.StatusForbidden, map[string]string{"error": "Permission denied"})
	}

	var sponsor models.Sponsor
	if err := c.Bind(&sponsor); err != nil {
		c.Logger().Error("Error binding sponsor: ", err)
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid input"})
	}

	if err := database.DB.Create(&sponsor).Error; err != nil {
		c.Logger().Error("Error creating sponsor in DB: ", err)
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to create sponsor"})
	}

	return c.JSON(http.StatusCreated, sponsor)
}

// GetSponsors - ดึงรายการ sponsor ทั้งหมด (เปิดให้ทุกคน)
func GetSponsors(c echo.Context) error {
	var sponsors []models.Sponsor

	if err := database.DB.Find(&sponsors).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to fetch sponsors"})
	}

	return c.JSON(http.StatusOK, sponsors)
}

// UpdateSponsor - อัปเดตข้อมูล sponsor (เฉพาะ admin)
func UpdateSponsor(c echo.Context) error {
	userRole := c.Get("userRole")
	if userRole != "admin" {
		return c.JSON(http.StatusForbidden, map[string]string{"error": "Permission denied"})
	}

	id := c.Param("id")
	uintID, err := strconv.ParseUint(id, 10, 32)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid ID"})
	}

	var sponsor models.Sponsor
	if err := database.DB.First(&sponsor, uint(uintID)).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.JSON(http.StatusNotFound, map[string]string{"error": "Sponsor not found"})
		}
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to fetch sponsor"})
	}

	if err := c.Bind(&sponsor); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid input"})
	}

	if err := database.DB.Save(&sponsor).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to update sponsor"})
	}

	return c.JSON(http.StatusOK, sponsor)
}

// DeleteSponsor - ลบ sponsor (เฉพาะ admin)
func DeleteSponsor(c echo.Context) error {
	userRole := c.Get("userRole")
	if userRole != "admin" {
		return c.JSON(http.StatusForbidden, map[string]string{"error": "Permission denied"})
	}

	id := c.Param("id")
	uintID, err := strconv.ParseUint(id, 10, 32)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid ID"})
	}

	if err := database.DB.Delete(&models.Sponsor{}, uint(uintID)).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to delete sponsor"})
	}

	return c.JSON(http.StatusOK, map[string]string{"message": "Sponsor deleted successfully"})
}
