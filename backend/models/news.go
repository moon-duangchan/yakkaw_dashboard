package models

import (
    "time"
)

// Category represents the 'Category' table in the database
type Category struct {
    ID   uint   `gorm:"primaryKey" json:"id"`
    Name string `gorm:"type:varchar(100)" json:"name"`

    // One-To-Many relationship: a Category has many News items
    News []News `json:"news"`
}

// News represents the 'News' table in the database
type News struct {
    ID          uint      `gorm:"primaryKey" json:"id"`
    Title       string    `gorm:"type:varchar(200)" json:"title"`
    Description string    `gorm:"type:text" json:"description"`
    Image       string    `gorm:"type:varchar(255)" json:"image"`
    URL         string    `gorm:"type:varchar(255)" json:"url"`
    Date        time.Time `json:"date"`

    // Foreign key for the Category
    CategoryID uint     `json:"category_id"`
    Category   Category `json:"category"` // to load the Category info if needed
}
