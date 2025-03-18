package services

import (
	"errors"
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
func (s *CategoryService) GetAllCategories() ([]models.Category, error) {
    var categories []models.Category

    // ✅ โหลด Category พร้อม News แต่ไม่ preload category ของ news
    if err := s.DB.Preload("News").Find(&categories).Error; err != nil {
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

func (s *CategoryService) DeleteCategory(id uint) error {
    result := s.DB.Delete(&models.Category{}, id)
    if result.RowsAffected == 0 {
        return errors.New("category not found")
    }
    return nil
}

// UpdateCategory updates an existing category entry
func (s *CategoryService) UpdateCategory(id uint, categoryUpdate models.Category) (models.Category, error) {
    var category models.Category

    // ค้นหาหมวดหมู่ที่ต้องการอัปเดต
    if err := s.DB.First(&category, id).Error; err != nil {
        return models.Category{}, errors.New("category not found")
    }

    // อัปเดตค่าข้อมูล
    category.Name = categoryUpdate.Name

    // บันทึกการเปลี่ยนแปลง
    if err := s.DB.Save(&category).Error; err != nil {
        return models.Category{}, err
    }

    return category, nil
}
