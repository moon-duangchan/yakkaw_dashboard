package services

import (
	"yakkaw_dashboard/database"
	"yakkaw_dashboard/models"
)

func CreateColorRange(ColorRange models.ColorRange) (models.ColorRange, error) {
	if err := database.DB.Create(&ColorRange).Error; err != nil {
		return models.ColorRange{}, err
	}
	return ColorRange, nil
}

func GetAllColorRanges() ([]models.ColorRange, error) {
	var colorRanges []models.ColorRange
	if err := database.DB.Find(&colorRanges).Error; err != nil {
		return nil, err
	}
	return colorRanges, nil
}

func GetColorRange(id string) (models.ColorRange, error) {
	var ColorRange models.ColorRange
	if err := database.DB.First(&ColorRange, id).Error; err != nil {
		return models.ColorRange{}, err
	}
	return ColorRange, nil
}

func UpdateColorRange(id string, input models.ColorRange) (models.ColorRange, error) {
	var ColorRange models.ColorRange
	if err := database.DB.First(&ColorRange, id).Error; err != nil {
		return models.ColorRange{}, err
	}
	ColorRange.Min = input.Min
	ColorRange.Max = input.Max
	ColorRange.Color = input.Color

	if err := database.DB.Save(&ColorRange).Error; err != nil {
		return models.ColorRange{}, err
	}
	return ColorRange, nil
}

func DeleteColorRange(id string) error {
	return database.DB.Delete(&models.ColorRange{}, id).Error
}
