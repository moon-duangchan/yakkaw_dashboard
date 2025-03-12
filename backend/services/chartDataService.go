package services

import (
	"time"

	"yakkaw_dashboard/database"
	"yakkaw_dashboard/models"
)

// GetChartData ดึงข้อมูลและ aggregate ค่า pm25 ตามช่วงเวลาที่ระบุ พร้อม filter ด้วย province (ถ้ามี)
func GetChartData(rangeType string, province string) (models.ChartData, error) {
	var chartData models.ChartData
	var baseQuery string

	switch rangeType {
	case "24 Hour":
		baseQuery = `
			SELECT date_trunc('hour', to_timestamp(timestamp/1000)) as time_label, AVG(pm25) as avg_pm25
			FROM sensor_data
			WHERE to_timestamp(timestamp/1000) >= now() - interval '24 hours'
		`
	case "1 Week":
		baseQuery = `
			SELECT date_trunc('day', to_timestamp(timestamp/1000)) as time_label, AVG(pm25) as avg_pm25
			FROM sensor_data
			WHERE to_timestamp(timestamp/1000) >= now() - interval '7 days'
		`
	case "1 Month":
		baseQuery = `
			SELECT date_trunc('week', to_timestamp(timestamp/1000)) as time_label, AVG(pm25) as avg_pm25
			FROM sensor_data
			WHERE to_timestamp(timestamp/1000) >= now() - interval '1 month'
		`
	case "3 Month":
		baseQuery = `
			SELECT date_trunc('month', to_timestamp(timestamp/1000)) as time_label, AVG(pm25) as avg_pm25
			FROM sensor_data
			WHERE to_timestamp(timestamp/1000) >= now() - interval '3 months'
		`
	case "1 Year":
		baseQuery = `
			SELECT date_trunc('month', to_timestamp(timestamp/1000)) as time_label, AVG(pm25) as avg_pm25
			FROM sensor_data
			WHERE to_timestamp(timestamp/1000) >= now() - interval '1 year'
		`
	default:
		baseQuery = `
			SELECT date_trunc('hour', to_timestamp(timestamp/1000)) as time_label, AVG(pm25) as avg_pm25
			FROM sensor_data
			WHERE to_timestamp(timestamp/1000) >= now() - interval '24 hours'
		`
	}

	// ถ้ามี province ให้เพิ่มเงื่อนไข filter โดยใช้ ILIKE เพื่อหา substring ใน address
	if province != "" {
		baseQuery += " AND address ILIKE ?"
	}

	baseQuery += " GROUP BY time_label ORDER BY time_label"

	type resultRow struct {
		TimeLabel time.Time
		AvgPM25   float64
	}
	var results []resultRow

	if province != "" {
		if err := database.DB.Raw(baseQuery, "%"+province+"%").Scan(&results).Error; err != nil {
			return chartData, err
		}
	} else {
		if err := database.DB.Raw(baseQuery).Scan(&results).Error; err != nil {
			return chartData, err
		}
	}

	labels := make([]string, 0, len(results))
	dataValues := make([]float64, 0, len(results))
	for _, row := range results {
		var label string
		switch rangeType {
		case "24 Hour":
			label = row.TimeLabel.Format("15:04")
		case "1 Week":
			label = row.TimeLabel.Format("Mon")
		case "1 Month":
			label = "Wk " + row.TimeLabel.Format("02")
		case "3 Month", "1 Year":
			label = row.TimeLabel.Format("Jan")
		default:
			label = row.TimeLabel.Format("15:04")
		}
		labels = append(labels, label)
		dataValues = append(dataValues, row.AvgPM25)
	}

	chartData.Labels = labels
	chartData.Datasets = []models.DatasetChart{
		{Data: dataValues},
	}

	return chartData, nil
}
