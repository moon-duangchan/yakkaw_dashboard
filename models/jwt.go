package models

import "github.com/golang-jwt/jwt/v4"

// JWTCustomClaims - Custom claims for JWT
type JWTCustomClaims struct {
	Username string `json:"username"`
	Role     string `json:"role"`
	jwt.StandardClaims
}
