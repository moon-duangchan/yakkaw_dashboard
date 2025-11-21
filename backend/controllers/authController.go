package controllers

import (
	"net/http"
	"net/url"
	"os"
	"strings"
	"time"
	"yakkaw_dashboard/database"
	"yakkaw_dashboard/models"

	"github.com/golang-jwt/jwt/v4"
	"github.com/labstack/echo/v4"
	"golang.org/x/crypto/bcrypt"
)

var jwtSecret = []byte("your-secret-key")

func shouldUseSecureCookie(c echo.Context) bool {
	if proto := c.Request().Header.Get("X-Forwarded-Proto"); proto != "" {
		return strings.EqualFold(proto, "https")
	}

	if forwarded := c.Request().Header.Get("Forwarded"); forwarded != "" {
		for _, part := range strings.Split(forwarded, ";") {
			if strings.EqualFold(strings.TrimSpace(part), "proto=https") {
				return true
			}
			if strings.EqualFold(strings.TrimSpace(part), "proto=http") {
				return false
			}
		}
	}

	for _, header := range []string{echo.HeaderOrigin, "Referer"} {
		if raw := c.Request().Header.Get(header); raw != "" {
			if u, err := url.Parse(raw); err == nil {
				if strings.EqualFold(u.Scheme, "https") {
					return true
				}
				if strings.EqualFold(u.Scheme, "http") {
					return false
				}
			}
		}
	}

	if c.Request().TLS != nil || strings.EqualFold(c.Scheme(), "https") {
		return true
	}

	env := os.Getenv("APP_ENV")
	return strings.EqualFold(env, "production")
}

// Login - Handle user login by verifying password from the database
// Login - Handle user login by verifying password from the database
func Login(c echo.Context) error {
	type loginRequest struct {
		Username string `json:"username" form:"username"`
		Password string `json:"password" form:"password"`
	}

	payload := loginRequest{
		Username: c.FormValue("username"),
		Password: c.FormValue("password"),
	}

	if payload.Username == "" || payload.Password == "" {
		if err := c.Bind(&payload); err != nil {
			return c.JSON(http.StatusBadRequest, "Invalid login payload")
		}
	}

	payload.Username = strings.TrimSpace(payload.Username)

	if payload.Username == "" || payload.Password == "" {
		return c.JSON(http.StatusBadRequest, "Username and password are required")
	}

	// Find user in the database
	var user models.User
	if err := database.DB.Where("username = ?", payload.Username).First(&user).Error; err != nil {
		return c.JSON(http.StatusUnauthorized, "Invalid username or password")
	}

	// Compare password with the hash in the database
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(payload.Password)); err != nil {
		return c.JSON(http.StatusUnauthorized, "Invalid username or password")
	}

	// Create JWT claims
	claims := jwt.MapClaims{
		"username": user.Username,
		"role":     user.Role,
		"exp":      time.Now().Add(time.Hour * 2).Unix(),
	}

	// Generate token
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(jwtSecret)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, "Error generating token")
	}

	// Set token in HttpOnly cookie
	cookie := new(http.Cookie)
	cookie.Name = "access_token"
	cookie.Value = tokenString
	cookie.HttpOnly = true
	cookie.Secure = shouldUseSecureCookie(c)
	cookie.Path = "/"
	cookie.Expires = time.Now().Add(time.Hour * 2)
	c.SetCookie(cookie)

	return c.JSON(http.StatusOK, map[string]string{"message": "Login successful"})
}

// Logout - Clears the cookie
func Logout(c echo.Context) error {
	cookie := new(http.Cookie)
	cookie.Name = "access_token"
	cookie.Value = ""
	cookie.HttpOnly = true
	cookie.Secure = shouldUseSecureCookie(c) // ต้องใช้ HTTPS
	cookie.Path = "/"
	cookie.Expires = time.Unix(0, 0) // หมดอายุทันที
	cookie.MaxAge = -1               // บังคับให้ลบ
	c.SetCookie(cookie)

	return c.JSON(http.StatusOK, map[string]string{"message": "Logged out successfully"})
}

// Register - Creates a new user
func Register(c echo.Context) error {
	var userRequest models.User

	// Bind request body to struct
	if err := c.Bind(&userRequest); err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	// Hash the password before saving it
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(userRequest.Password), bcrypt.DefaultCost)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, "Error hashing password")
	}

	// Set default role
	if userRequest.Role == "" {
		userRequest.Role = "user"
	}

	// If username is "admin", assign admin role
	if userRequest.Username == "admin" {
		userRequest.Role = "admin"
	}

	userRequest.Password = string(hashedPassword)

	// Save user to database
	if err := database.DB.Create(&userRequest).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, "Error registering user")
	}

	return c.JSON(http.StatusCreated, userRequest)
}

// Me - Check user authentication status
func Me(c echo.Context) error {
	cookie, err := c.Cookie("access_token")
	if err != nil {
		return c.JSON(http.StatusUnauthorized, map[string]string{"message": "Unauthorized"})
	}

	token, err := jwt.Parse(cookie.Value, func(token *jwt.Token) (interface{}, error) {
		return jwtSecret, nil
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
