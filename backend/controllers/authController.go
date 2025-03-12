package controllers

import (
	"net/http"
	"time"
	"yakkaw_dashboard/database"
	"yakkaw_dashboard/models"

	"github.com/golang-jwt/jwt/v4"
	"github.com/labstack/echo/v4"
	"golang.org/x/crypto/bcrypt"
)

var jwtSecret = []byte("your-secret-key")

// Login - Handle user login by verifying password from the database
// Login - Handle user login by verifying password from the database
func Login(c echo.Context) error {
	username := c.FormValue("username")
	password := c.FormValue("password")

	// Find user in the database
	var user models.User
	if err := database.DB.Where("username = ?", username).First(&user).Error; err != nil {
		return c.JSON(http.StatusUnauthorized, "Invalid username or password")
	}

	// Compare password with the hash in the database
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password)); err != nil {
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
	cookie.Secure = true 
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
	cookie.Secure = true  // ต้องใช้ HTTPS
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
