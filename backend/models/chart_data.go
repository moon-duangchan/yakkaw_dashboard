package models

type ChartData struct {
	Labels   []string       `json:"labels"`
	Datasets []DatasetChart `json:"datasets"`
}

type DatasetChart struct {
	Data []float64 `json:"data"`
}
