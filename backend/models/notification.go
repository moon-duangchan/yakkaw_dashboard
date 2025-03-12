package models

import "gorm.io/gorm"

// Notification struct represents the structure of a notification in the database.
type Notification struct {
    gorm.Model
    Title   string `json:"title"`
    Message string `json:"message"`
    ID      uint   `json:"id"`
    Category string `json:"category"`
    Icon    string `json:"icon,omitempty"`
}
