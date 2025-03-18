package services

import (
	"time"
	"yakkaw_dashboard/models"

	"gorm.io/gorm"
)

type NewsService struct {
    DB *gorm.DB
}

// NewNewsService creates a new NewsService instance
func NewNewsService(db *gorm.DB) *NewsService {
    return &NewsService{DB: db}
}

// CreateNews creates a new news entry
func (s *NewsService) CreateNews(news models.News) (models.News, error) {
    // If date not set, set it to current time
    if news.Date.IsZero() {
        news.Date = time.Now()
    }

    if err := s.DB.Create(&news).Error; err != nil {
        return models.News{}, err
    }
    return news, nil
}

// GetAllNews returns all news, optionally with Category
func (s *NewsService) GetAllNews(preloadCategory bool) ([]models.News, error) {
    var news []models.News
    query := s.DB
    if preloadCategory {
        query = query.Preload("Category")
    }
    if err := query.Find(&news).Error; err != nil {
        return nil, err
    }
    return news, nil
}

// GetNewsByID fetches a single news record by ID
func (s *NewsService) GetNewsByID(id uint) (models.News, error) {
    var news models.News
    if err := s.DB.First(&news, id).Error; err != nil {
        return models.News{}, err
    }
    return news, nil
}
