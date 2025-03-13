package models

type ChartData struct {
    Labels   []string        `json:"labels" gorm:"type:json"`  // หรือ gorm:"serializer:json"
    Datasets []DatasetChart  `json:"datasets" gorm:"type:json"`
}

type DatasetChart struct {
    Data []float64 `json:"data" gorm:"type:json"`
}
