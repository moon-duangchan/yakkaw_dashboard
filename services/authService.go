package services

import (
    "time"
    "github.com/dgrijalva/jwt-go"
    "yakkaw_dashboard/models"
)

var jwtSecret = []byte("yourSecretKey")

func GenerateJWT(user models.User) (string, error) {
    token := jwt.New(jwt.SigningMethodHS256)
    claims := token.Claims.(jwt.MapClaims)
    claims["username"] = user.Username
    claims["role"] = user.Role
    claims["exp"] = time.Now().Add(time.Hour * 72).Unix()

    tokenString, err := token.SignedString(jwtSecret)
    if err != nil {
        return "", err
    }
    return tokenString, nil
}

func ValidateToken(tokenString string) (*jwt.Token, error) {
    return jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
        return jwtSecret, nil
    })
}
