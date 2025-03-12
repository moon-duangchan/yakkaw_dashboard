package controllers

import (
	"net/http"
	"strconv"
	"yakkaw_dashboard/database"
	"yakkaw_dashboard/models"
	"github.com/labstack/echo/v4"
	"gorm.io/gorm"
	"fmt"
	"time"
)

func CreateNotification(c echo.Context) error {
	userRole := c.Get("userRole")
	if userRole != "admin" {
		return c.JSON(http.StatusForbidden, map[string]string{"error": "Permission denied"})
	}

	var notification models.Notification
	if err := c.Bind(&notification); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid input"})
	}

	if notification.Icon == "" {
		notification.Icon = "default-icon-url" 
	}

	if err := database.DB.Create(&notification).Error; err != nil {
		c.Logger().Error(err) 
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to save notification"})
	}

	return c.JSON(http.StatusCreated, notification)
}

func GetNotifications(c echo.Context) error {
	var notifications []models.Notification

	if err := database.DB.Find(&notifications).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to fetch notifications"})
	}

	var response []map[string]interface{}
	for _, notification := range notifications {
		timeAgo := timeAgo(notification.CreatedAt)

		response = append(response, map[string]interface{}{
			"id":      notification.ID,
			"title":   notification.Title,
			"message": notification.Message,
			"category": notification.Category,
			"time":    timeAgo,
			"icon":    notification.Icon, // หากไม่อยากแสดง icon ก็ไม่ต้องส่งออก
		})
	}

	return c.JSON(http.StatusOK, response)
}

func DeleteNotification(c echo.Context) error {
	userRole := c.Get("userRole")
	if userRole != "admin" {
		return c.JSON(http.StatusForbidden, map[string]string{"error": "Permission denied"})
	}

	id := c.Param("id")
	uintID, err := strconv.ParseUint(id, 10, 32)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid ID"})
	}

	var notification models.Notification
	if err := database.DB.Where("id = ?", uint(uintID)).First(&notification).Error; err != nil {

		if err == gorm.ErrRecordNotFound {
			return c.JSON(http.StatusNotFound, map[string]string{"error": "Notification not found"})
		}
		c.Logger().Error(err) 
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to find notification"})
	}

	if err := database.DB.Unscoped().Delete(&models.Notification{}, uint(uintID)).Error; err != nil {
		c.Logger().Error(err) // Log error for debugging
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to delete notification"})
	}

	return c.JSON(http.StatusOK, map[string]string{"message": "Notification deleted successfully"})
}

func UpdateNotification(c echo.Context) error {

	userRole := c.Get("userRole")
	if userRole != "admin" {
		return c.JSON(http.StatusForbidden, map[string]string{"error": "Permission denied"})
	}

	id := c.Param("id")
	uintID, err := strconv.ParseUint(id, 10, 32)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid ID"})
	}


	var updatedNotification models.Notification
	if err := c.Bind(&updatedNotification); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid input"})
	}


	var notification models.Notification
	if err := database.DB.First(&notification, uint(uintID)).Error; err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": "Notification not found"})
	}

	notification.Title = updatedNotification.Title
	notification.Message = updatedNotification.Message
	notification.Icon = updatedNotification.Icon
	notification.Category = updatedNotification.Category

	if err := database.DB.Save(&notification).Error; err != nil {
		c.Logger().Error(err) 
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to update notification"})
	}

	return c.JSON(http.StatusOK, notification)
}

func timeAgo(createdAt time.Time) string {
	duration := time.Since(createdAt)

	switch {
	case duration < time.Minute:
		return "Just now"
	case duration < time.Hour:
		return fmt.Sprintf("%d minutes ago", int(duration.Minutes()))
	case duration < time.Hour * 24:
		return fmt.Sprintf("%d hours ago", int(duration.Hours()))
	case duration < 7*24*time.Hour:
		return fmt.Sprintf("%d days ago", int(duration.Hours()/24))
	case duration < 30*24*time.Hour:
		return fmt.Sprintf("%d weeks ago", int(duration.Hours()/(24*7)))
	default:
		return fmt.Sprintf("%d months ago", int(duration.Hours()/(24*30)))
	}
}