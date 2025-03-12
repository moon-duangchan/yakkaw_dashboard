package controllers

import (
    "net/http"
    "github.com/labstack/echo/v4"
    "yakkaw_dashboard/database"
    "yakkaw_dashboard/models"
)

func GetAllUsers(c echo.Context) error {
    var users []models.User
    if err := database.DB.Find(&users).Error; err != nil {
        return c.JSON(http.StatusInternalServerError, "Error fetching users")
    }
    return c.JSON(http.StatusOK, users)
}

func DeleteUser(c echo.Context) error {
    userID := c.Param("id")
    if err := database.DB.Delete(&models.User{}, userID).Error; err != nil {
        return c.JSON(http.StatusInternalServerError, "Error deleting user")
    }
    return c.JSON(http.StatusOK, "User deleted successfully")
}
