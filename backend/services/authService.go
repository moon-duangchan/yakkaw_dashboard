package services

import (
    "os"
    "time"
    jwt "github.com/golang-jwt/jwt/v4"
    "yakkaw_dashboard/models"
)

func jwtSecretBytes() []byte {
    s := os.Getenv("JWT_SECRET")
    if s == "" {
        s = "your-secret-key"
    }
    return []byte(s)
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
