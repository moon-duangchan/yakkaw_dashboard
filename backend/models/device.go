package models

import (
	"time"

	"gorm.io/gorm"
)

type Device struct {
	gorm.Model
	DVID         string    `gorm:"column:dv_id;type:varchar(255);not null" json:"dvid"`
	Address      string    `gorm:"type:varchar(255);not null" json:"address"`
	Longitude    float64   `gorm:"type:float;not null" json:"longitude"`
	Latitude     float64   `gorm:"type:float;not null" json:"latitude"`
	Place        string    `gorm:"type:varchar(255);not null" json:"place"`
	Models       string    `gorm:"type:varchar(255);not null" json:"models"`
	ContactName  string    `gorm:"type:varchar(255);not null" json:"contact_name"`
	ContactPhone string    `gorm:"type:varchar(255);not null" json:"contact_phone"`
	DeployDate   time.Time `gorm:"type:timestamp;not null" json:"deploy_date"`
}
