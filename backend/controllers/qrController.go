package controllers

import (
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v4"
	"github.com/labstack/echo/v4"

	"yakkaw_dashboard/config"
	"yakkaw_dashboard/models"
)

// GenerateQRLogin issues a short-lived (5m) JWT suitable for QR login.
// Must be called by an authenticated admin (under /admin group).
func GenerateQRLogin(c echo.Context) error {
	// Optional: enforce admin role explicitly
	role, _ := c.Get("userRole").(string)
	if role != "admin" {
		return c.JSON(http.StatusForbidden, map[string]string{"message": "admin role required"})
	}

	// Claims
	username := "admin"
	if u, ok := c.Get("user").(*models.JWTCustomClaims); ok {
		if u.Username != "" {
			username = u.Username
		}
	}

	now := time.Now()
	exp := now.Add(5 * time.Minute)
	claims := jwt.MapClaims{
		"username": username,
		"role":     "admin", // ensure admin for device creation
		"type":     "qr",
		"iat":      now.Unix(),
		"exp":      exp.Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(getJWTSecret())
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "failed to sign token"})
	}

	// Build consume URL with optional frontend redirect
	redirect := c.QueryParam("redirect")
	consumeURL, err := buildQRConsumeURL(tokenString, redirect)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "invalid QR consume base URL"})
	}

	return c.JSON(http.StatusOK, map[string]string{
		"token":      tokenString,
		"url":        consumeURL,
		"expires_at": exp.UTC().Format(time.RFC3339),
	})
}

// ConsumeQRLogin validates the QR token, sets the auth cookie, and redirects.
func ConsumeQRLogin(c echo.Context) error {
	tokenString := c.QueryParam("token")
	if tokenString == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "missing token"})
	}

	token, err := jwt.Parse(tokenString, func(t *jwt.Token) (interface{}, error) {
		return getJWTSecret(), nil
	})
	if err != nil || !token.Valid {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "invalid token"})
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "invalid claims"})
	}

	// Ensure it's a QR token and not an arbitrary JWT
	if t, _ := claims["type"].(string); t != "qr" {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "invalid token type"})
	}

	// Set cookie with remaining TTL (respect token exp)
	expUnix, _ := claims["exp"].(float64)
	expTime := time.Unix(int64(expUnix), 0)

	cookie := new(http.Cookie)
	cookie.Name = "access_token"
	cookie.Value = tokenString
	cookie.HttpOnly = true
	configureAuthCookie(cookie)
	cookie.Path = "/"
	cookie.Expires = expTime
	c.SetCookie(cookie)

	// Redirect to frontend page for device creation via QR
	redirect := c.QueryParam("redirect")
	if redirect == "" {
		redirect = config.Get().QRDefaultRedirect
	}
	return c.Redirect(http.StatusFound, redirect)
}

func buildQRConsumeURL(token, redirect string) (string, error) {
	cfg := config.Get()
	base := strings.TrimRight(cfg.QRConsumeBaseURL, "/")
	consumeURL, err := url.Parse(base + "/qr/consume")
	if err != nil {
		return "", err
	}

	q := consumeURL.Query()
	q.Set("token", token)
	if redirect != "" {
		q.Set("redirect", redirect)
	}
	consumeURL.RawQuery = q.Encode()
	return consumeURL.String(), nil
}
