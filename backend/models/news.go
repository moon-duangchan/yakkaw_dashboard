package models

import "time"

type News struct {
    ID          uint      `gorm:"primaryKey" json:"id"`
    Title       string    `gorm:"type:varchar(200)" json:"title"`
    Description string    `gorm:"type:text" json:"description"`
    Image       string    `gorm:"type:varchar(255)" json:"image"`
    URL         string    `gorm:"type:varchar(255)" json:"url"`
    Date        time.Time `json:"date"`

    CategoryID uint      `json:"category_id"`
    Category   *Category `gorm:"foreignKey:CategoryID" json:"category,omitempty"` // ✅ ซ่อน category หากไม่มีข้อมูล
}
