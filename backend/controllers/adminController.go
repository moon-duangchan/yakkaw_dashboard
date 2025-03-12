package controllers

import (
    "net/http"
    "yakkaw_dashboard/models"  // Import models package for JWTCustomClaims
    "github.com/labstack/echo/v4"
)

// AdminDashboard - ตรวจสอบ role ก่อนให้เข้าใช้งาน
func AdminDashboard(c echo.Context) error {
    // Corrected to use "user" key for claims
    userClaims, ok := c.Get("user").(*models.JWTCustomClaims)
    if !ok {
        c.Logger().Error("Failed to extract user claims")
        return c.JSON(http.StatusUnauthorized, "Invalid token claims")
    }

    // Debug: Print user role in logs
    c.Logger().Infof("User role: %s", userClaims.Role)

    // ตรวจสอบว่า user เป็น admin หรือไม่
    if userClaims.Role != "admin" {
        return c.JSON(http.StatusForbidden, "Access denied")
    }

    return c.JSON(http.StatusOK, map[string]string{
        "message": "Welcome to the admin dashboard",
    })
}
