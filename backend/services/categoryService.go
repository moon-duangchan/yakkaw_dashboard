package services

import (
	"yakkaw_dashboard/models"

	"gorm.io/gorm"
)

type CategoryService struct {
    DB *gorm.DB
}

// NewCategoryService creates a new CategoryService instance
func NewCategoryService(db *gorm.DB) *CategoryService {
    return &CategoryService{DB: db}
}

// CreateCategory creates a new category
func (s *CategoryService) CreateCategory(category models.Category) (models.Category, error) {
    if err := s.DB.Create(&category).Error; err != nil {
        return models.Category{}, err
    }
    return category, nil
}

// GetAllCategories returns all categories, optionally with News
func (s *CategoryService) GetAllCategories(preloadNews bool) ([]models.Category, error) {
    var categories []models.Category
    query := s.DB
    if preloadNews {
        query = query.Preload("News")
    }
    if err := query.Find(&categories).Error; err != nil {
        return nil, err
    }
    return categories, nil
}

// GetCategoryByID fetches a single category by ID
func (s *CategoryService) GetCategoryByID(id uint) (models.Category, error) {
    var category models.Category
    if err := s.DB.First(&category, id).Error; err != nil {
        return models.Category{}, err
    }
    return category, nil
}
