package controllers

import (
	"errors"
	"net/http"
	"os"
	"strings"
	"time"
	"yakkaw_dashboard/database"
	"yakkaw_dashboard/models"

	"github.com/golang-jwt/jwt/v4"
	"github.com/labstack/echo/v4"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

var defaultJWTSecret = []byte("your-secret-key")

type loginRequest struct {
	Username string `json:"username" form:"username"`
	Password string `json:"password" form:"password"`
}

type registerRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
	Role     string `json:"role"`
}

func getJWTSecret() []byte {
	if secret := os.Getenv("JWT_SECRET"); secret != "" {
		return []byte(secret)
	}
	return defaultJWTSecret
}

// Login verifies credentials and mints a JWT stored in an HttpOnly cookie.
func Login(c echo.Context) error {
	var req loginRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"message": "Invalid payload"})
	}

	// Support both JSON and form submissions.
	if req.Username == "" {
		req.Username = c.FormValue("username")
	}
	if req.Password == "" {
		req.Password = c.FormValue("password")
	}

	req.Username = strings.TrimSpace(req.Username)
	if req.Username == "" || req.Password == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{"message": "Username and password are required"})
	}

	var user models.User
	if err := database.DB.Where("username = ?", req.Username).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return c.JSON(http.StatusUnauthorized, map[string]string{"message": "Invalid username or password"})
		}
		return c.JSON(http.StatusInternalServerError, map[string]string{"message": "Unable to fetch user"})
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		return c.JSON(http.StatusUnauthorized, map[string]string{"message": "Invalid username or password"})
	}

	claims := jwt.MapClaims{
		"username": user.Username,
		"role":     user.Role,
		"exp":      time.Now().Add(2 * time.Hour).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(getJWTSecret())
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"message": "Unable to generate token"})
	}

	cookie := new(http.Cookie)
	cookie.Name = "access_token"
	cookie.Value = tokenString
	cookie.HttpOnly = true
	cookie.Path = "/"
	cookie.Expires = time.Now().Add(2 * time.Hour)
	cookie.SameSite = http.SameSiteLaxMode
	cookie.Secure = os.Getenv("APP_ENV") == "production"
	c.SetCookie(cookie)

	return c.JSON(http.StatusOK, map[string]string{"message": "Login successful"})
}

// Logout clears the auth cookie.
func Logout(c echo.Context) error {
	cookie := new(http.Cookie)
	cookie.Name = "access_token"
	cookie.Value = ""
	cookie.HttpOnly = true
	cookie.Path = "/"
	cookie.Expires = time.Unix(0, 0)
	cookie.MaxAge = -1
	cookie.SameSite = http.SameSiteLaxMode
	cookie.Secure = os.Getenv("APP_ENV") == "production"
	c.SetCookie(cookie)

	return c.JSON(http.StatusOK, map[string]string{"message": "Logged out successfully"})
}

// Register creates a new account with a hashed password.
func Register(c echo.Context) error {
	var req registerRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"message": "Invalid payload"})
	}

	// Support form submissions as well.
	if req.Username == "" {
		req.Username = c.FormValue("username")
	}
	if req.Password == "" {
		req.Password = c.FormValue("password")
	}
	if req.Role == "" {
		req.Role = c.FormValue("role")
	}

	req.Username = strings.TrimSpace(req.Username)
	if req.Username == "" || req.Password == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{"message": "Username and password are required"})
	}

	// Ensure username is unique.
	var existing models.User
	if err := database.DB.Where("username = ?", req.Username).First(&existing).Error; err == nil {
		return c.JSON(http.StatusConflict, map[string]string{"message": "Username already exists"})
	} else if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return c.JSON(http.StatusInternalServerError, map[string]string{"message": "Unable to check existing users"})
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"message": "Unable to hash password"})
	}

	role := strings.TrimSpace(req.Role)
	if role == "" {
		role = "user"
	}
	// Grant admin role explicitly only when username is admin to preserve current behavior.
	if req.Username == "admin" {
		role = "admin"
	}

	user := models.User{
		Username: req.Username,
		Password: string(hashedPassword),
		Role:     role,
	}

	if err := database.DB.Create(&user).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"message": "Error registering user"})
	}

	return c.JSON(http.StatusCreated, map[string]string{
		"username": user.Username,
		"role":     user.Role,
		"message":  "Registration successful",
	})
}

// Me returns the authenticated user's profile if the token is valid.
func Me(c echo.Context) error {
	cookie, err := c.Cookie("access_token")
	if err != nil {
		return c.JSON(http.StatusUnauthorized, map[string]string{"message": "Unauthorized"})
	}

	token, err := jwt.Parse(cookie.Value, func(token *jwt.Token) (interface{}, error) {
		return getJWTSecret(), nil
	})
	if err != nil || !token.Valid {
		return c.JSON(http.StatusUnauthorized, map[string]string{"message": "Invalid token"})
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return c.JSON(http.StatusUnauthorized, map[string]string{"message": "Invalid token claims"})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"username": claims["username"],
		"role":     claims["role"],
	})
}
