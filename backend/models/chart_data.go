package models

type ChartData struct {
    Labels   []string        `json:"labels" gorm:"type:json"`  // หรือ gorm:"serializer:json"
    Datasets []DatasetChart  `json:"datasets" gorm:"type:json"`
}

type DatasetChart struct {
	Label string	`json:"label" gorm:"type:json"`
    Data []float64 `json:"data" gorm:"type:json"`
}
