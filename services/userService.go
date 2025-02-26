package services

import (
    "yakkaw_dashboard/models"
    "yakkaw_dashboard/database"
)

func CreateUser(user models.User) (models.User, error) {
    result := database.DB.Create(&user)
    return user, result.Error
}

func GetUsers() ([]models.User, error) {
    var users []models.User
    result := database.DB.Find(&users)
    return users, result.Error
}
