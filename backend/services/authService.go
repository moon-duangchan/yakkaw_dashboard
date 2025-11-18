package services

import (
	"time"

	jwt "github.com/golang-jwt/jwt/v4"

	"yakkaw_dashboard/config"
	"yakkaw_dashboard/models"
)

func jwtSecretBytes() []byte {
	return []byte(config.Get().JWTSecret)
}

func GenerateJWT(user models.User) (string, error) {
	token := jwt.New(jwt.SigningMethodHS256)
	claims := token.Claims.(jwt.MapClaims)
	claims["username"] = user.Username
	claims["role"] = user.Role
	claims["exp"] = time.Now().Add(time.Hour * 72).Unix()

	tokenString, err := token.SignedString(jwtSecretBytes())
	if err != nil {
		return "", err
	}
	return tokenString, nil
}

func ValidateToken(tokenString string) (*jwt.Token, error) {
	return jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		return jwtSecretBytes(), nil
	})
}
