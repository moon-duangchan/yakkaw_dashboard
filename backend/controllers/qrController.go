package controllers

import (
    "net/http"
    "net/url"
    "os"
    "time"

    "github.com/golang-jwt/jwt/v4"
    "github.com/labstack/echo/v4"
    "yakkaw_dashboard/models"
)

// getJWTSecret reads JWT secret from env or falls back to project default.
func getJWTSecret() []byte {
    secret := os.Getenv("JWT_SECRET")
    if secret == "" {
        // Keep in sync with middlewares/jwt.go and authController.go fallback
        secret = "your-secret-key"
    }
    return []byte(secret)
}

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
    consumeURL := url.URL{
        Scheme: "http",
        Host:   "localhost:8080",
        Path:   "/qr/consume",
    }
    q := consumeURL.Query()
    q.Set("token", tokenString)
    if redirect != "" {
        q.Set("redirect", redirect)
    }
    consumeURL.RawQuery = q.Encode()

    return c.JSON(http.StatusOK, map[string]string{
        "token": tokenString,
        "url":   consumeURL.String(),
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
    cookie.SameSite = http.SameSiteLaxMode
    cookie.Path = "/"
    cookie.Expires = expTime
    cookie.Secure = os.Getenv("APP_ENV") == "production"
    c.SetCookie(cookie)

    // Redirect to frontend page for device creation via QR
    redirect := c.QueryParam("redirect")
    if redirect == "" {
        redirect = "http://localhost:3000/qr-create-device"
    }
    return c.Redirect(http.StatusFound, redirect)
}
