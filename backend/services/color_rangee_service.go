package services

import (
	"yakkaw_dashboard/database"
	"yakkaw_dashboard/models"
)

func CreateColorRangee(colorRangee models.ColorRangee) (models.ColorRangee, error) {
	if err := database.DB.Create(&colorRangee).Error; err != nil {
		return models.ColorRangee{}, err
	}
	return colorRangee, nil
}

func GetAllColorRanges() ([]models.ColorRangee, error) {
	var colorRanges []models.ColorRangee
	if err := database.DB.Find(&colorRanges).Error; err != nil {
		return nil, err
	}
	return colorRanges, nil
}

func GetColorRangee(id string) (models.ColorRangee, error) {
	var colorRangee models.ColorRangee
	if err := database.DB.First(&colorRangee, id).Error; err != nil {
		return models.ColorRangee{}, err
	}
	return colorRangee, nil
}

func UpdateColorRangee(id string, input models.ColorRangee) (models.ColorRangee, error) {
	var colorRangee models.ColorRangee
	if err := database.DB.First(&colorRangee, id).Error; err != nil {
		return models.ColorRangee{}, err
	}
	colorRangee.Min = input.Min
	colorRangee.Max = input.Max
	colorRangee.Color = input.Color

	if err := database.DB.Save(&colorRangee).Error; err != nil {
		return models.ColorRangee{}, err
	}
	return colorRangee, nil
}

func DeleteColorRangee(id string) error {
	return database.DB.Delete(&models.ColorRangee{}, id).Error
}
