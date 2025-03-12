package models

import "gorm.io/gorm"

type Sponsor struct {
	gorm.Model
	ID          uint      `gorm:"primaryKey" json:"id"`
	Name        string    `json:"name"`
	Logo        string    `json:"logo"`        // URL ของโลโก้
	Description string    `json:"description"` // รายละเอียดเกี่ยวกับ sponsor
	Category	 string    `json:"category"`     // ประเภทของ sponsor
}