package models

type Category struct {
    ID   uint   `gorm:"primaryKey" json:"id"`
    Name string `gorm:"type:varchar(100)" json:"name"`
    
    News []News `json:"news,omitempty"` // ✅ ป้องกัน category preload news อีกที
}
