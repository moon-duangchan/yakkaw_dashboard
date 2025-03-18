package services

import (
	"errors"
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
    // ตั้งค่าเวลาปัจจุบันหากไม่มีการระบุ
    if news.Date.IsZero() {
        news.Date = time.Now()
    }

    if err := s.DB.Create(&news).Error; err != nil {
        return models.News{}, err
    }

    // โหลดข้อมูล Category ของข่าวที่สร้างใหม่
    s.DB.Preload("Category").First(&news, news.ID)

    return news, nil
}


// GetAllNews returns all news, optionally with Category
func (s *NewsService) GetAllNews() ([]models.News, error) {
    var news []models.News

    // ✅ โหลด News พร้อม Category (แต่ไม่ให้ preload news อีก)
    if err := s.DB.Preload("Category").Find(&news).Error; err != nil {
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



func (s *NewsService) DeleteNews(id uint) error {
    result := s.DB.Delete(&models.News{}, id)
    if result.RowsAffected == 0 {
        return errors.New("news not found")
    }
    return nil
}

// UpdateNews updates an existing news entry
func (s *NewsService) UpdateNews(id uint, newsUpdate models.News) (models.News, error) {
    var news models.News

    // ค้นหาข่าวที่ต้องการอัปเดต
    if err := s.DB.First(&news, id).Error; err != nil {
        return models.News{}, errors.New("news not found")
    }

    // อัปเดตค่าข้อมูล
    news.Title = newsUpdate.Title
    news.Description = newsUpdate.Description
    news.Image = newsUpdate.Image
    news.URL = newsUpdate.URL
    news.CategoryID = newsUpdate.CategoryID

    // อัปเดตวันที่ถ้าไม่ได้ระบุมา
    if newsUpdate.Date.IsZero() {
        news.Date = time.Now()
    } else {
        news.Date = newsUpdate.Date
    }

    // บันทึกการเปลี่ยนแปลง
    if err := s.DB.Save(&news).Error; err != nil {
        return models.News{}, err
    }

    // โหลดข้อมูลหมวดหมู่ที่อัปเดต
    s.DB.Preload("Category").First(&news, id)

    return news, nil
}
