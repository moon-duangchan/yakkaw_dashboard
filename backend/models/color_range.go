package models

import (
	"gorm.io/gorm"
)

type ColorRange struct {
	gorm.Model
	Min   int    `json:"min"`
	Max   int    `json:"max"`
	Color string `json:"color"`
}
