package middleware

import (
    "net/http"
    "os"
    "yakkaw_dashboard/models"
    "github.com/labstack/echo/v4"
    "github.com/golang-jwt/jwt/v4"
)

func JWTMiddleware(next echo.HandlerFunc) echo.HandlerFunc {
    return func(c echo.Context) error {
        cookie, err := c.Cookie("access_token")
        if err != nil {
            c.Logger().Error("No token provided")
            return c.JSON(http.StatusUnauthorized, "Unauthorized: No token provided")
        }

        tokenString := cookie.Value
        claims := &models.JWTCustomClaims{}

        // Secret from env or fallback
        secret := os.Getenv("JWT_SECRET")
        if secret == "" {
            secret = "your-secret-key"
        }

        // Parse JWT
        token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
            return []byte(secret), nil
        })
        if err != nil || !token.Valid {
            c.Logger().Error("Invalid token")
            return c.JSON(http.StatusUnauthorized, "Unauthorized: Invalid token")
        }

        // Attach claims to context for downstream handlers
        c.Set("user", claims)
        c.Set("userRole", claims.Role)
        c.Logger().Infof("Token is valid. User: %s, Role: %s", claims.Username, claims.Role)

        return next(c)
    }
}
