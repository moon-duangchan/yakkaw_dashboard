package services

import (
	"encoding/json"
	"io/ioutil"
	"log"
	"net/http"
	"time"

	"yakkaw_dashboard/database"
	"yakkaw_dashboard/models"
)

// FetchAndStoreData ดึงข้อมูลจาก API แล้วเก็บลง DB (ด้วย Raw SQL ผ่าน GORM)
func FetchAndStoreData(apiURL string) {
	resp, err := http.Get(apiURL)
	if err != nil {
		log.Printf("Error fetching API: %v", err)
		return
	}
	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		log.Printf("Error reading response body: %v", err)
		return
	}

	var apiResp models.APIResponse
	if err := json.Unmarshal(body, &apiResp); err != nil {
		log.Printf("Error unmarshaling JSON: %v", err)
		return
	}

	// วนลูป insert ข้อมูลลงในตาราง sensor_data
	for _, data := range apiResp.Response {

		// GORM: Exec() จะคืนค่าเป็น *gorm.DB
		result := database.DB.Exec(`
			INSERT INTO sensor_data (
				dvid, deviceid, status, latitude, longitude, place, address, model,
				deploydate, contactname, contactphone, note, ddate, dtime, timestamp,
				av24h, av12h, av6h, av3h, av1h, pm25, pm10, pm100, aqi,
				temperature, humidity, pres, color, trend
			) VALUES (
				?, ?, ?, ?, ?, ?, ?, ?,
				?, ?, ?, ?, ?, ?, ?,
				?, ?, ?, ?, ?, ?, ?, ?, ?,
				?, ?, ?, ?, ?
			)
		`,
			data.DVID, data.DeviceID, data.Status, data.Latitude, data.Longitude,
			data.Place, data.Address, data.Model, data.DeployDate, data.ContactName,
			data.ContactPhone, data.Note, data.DDate, data.DTime, data.Timestamp,
			data.Av24h, data.Av12h, data.Av6h, data.Av3h, data.Av1h, data.PM25,
			data.PM10, data.PM100, data.AQI, data.Temperature, data.Humidity,
			data.Pres, data.Color, data.Trend,
		)

		if result.Error != nil {
			log.Printf("Error inserting data: %v", result.Error)
		}
	}
}

// GetAirQuality24Hours ค่าเฉลี่ย 24 ชั่วโมง พร้อมระบุช่วงเวลาที่ใช้ดึงข้อมูล
func GetAirQuality24Hours() (map[string]interface{}, error) {
	query := `
        SELECT address, AVG(pm25) AS avg_pm25, AVG(pm10) AS avg_pm10
        FROM sensor_data
        WHERE to_timestamp(timestamp/1000) BETWEEN now() - interval '24 hours' AND now()
        GROUP BY address
    `
	data, err := queryAirQuality(query)
	if err != nil {
		return nil, err
	}

	current := time.Now()
	past := current.Add(-24 * time.Hour)

	response := map[string]interface{}{
		"current_date": current,
		"past_date":    past,
		"data":         data,
	}

	return response, nil
}

// GetAirQualityOneMonth ค่าเฉลี่ย 1 เดือน พร้อมระบุช่วงเวลาที่ใช้ดึงข้อมูล
func GetAirQualityOneMonth() (map[string]interface{}, error) {
	query := `
        SELECT address, AVG(pm25) AS avg_pm25, AVG(pm10) AS avg_pm10
        FROM sensor_data
        WHERE to_timestamp(timestamp/1000) BETWEEN now() - interval '1 month' AND now()
        GROUP BY address
    `
	data, err := queryAirQuality(query)
	if err != nil {
		return nil, err
	}

	current := time.Now()
	// ใช้ AddDate เพื่อหาค่ากลับไป 1 เดือน
	past := current.AddDate(0, -1, 0)

	response := map[string]interface{}{
		"current_date": current,
		"past_date":    past,
		"data":         data,
	}

	return response, nil
}

// GetAirQualityThreeMonths ค่าเฉลี่ย 3 เดือน พร้อมระบุช่วงเวลาที่ใช้ดึงข้อมูล
func GetAirQualityThreeMonths() (map[string]interface{}, error) {
	query := `
        SELECT address, AVG(pm25) AS avg_pm25, AVG(pm10) AS avg_pm10
        FROM sensor_data
        WHERE to_timestamp(timestamp/1000) BETWEEN now() - interval '3 months' AND now()
        GROUP BY address
    `
	data, err := queryAirQuality(query)
	if err != nil {
		return nil, err
	}

	current := time.Now()
	past := current.AddDate(0, -3, 0)

	response := map[string]interface{}{
		"current_date": current,
		"past_date":    past,
		"data":         data,
	}

	return response, nil
}

// GetAirQualityOneYear ค่าเฉลี่ย 1 ปี พร้อมระบุช่วงเวลาที่ใช้ดึงข้อมูล
func GetAirQualityOneYear() (map[string]interface{}, error) {
	query := `
        SELECT address, AVG(pm25) AS avg_pm25, AVG(pm10) AS avg_pm10
        FROM sensor_data
        WHERE to_timestamp(timestamp/1000) BETWEEN now() - interval '1 year' AND now()
        GROUP BY address
    `
	data, err := queryAirQuality(query)
	if err != nil {
		return nil, err
	}

	current := time.Now()
	past := current.AddDate(-1, 0, 0)

	response := map[string]interface{}{
		"current_date": current,
		"past_date":    past,
		"data":         data,
	}

	return response, nil
}

// GetAirQualityOneWeek ค่าเฉลี่ย 1 สัปดาห์ พร้อมระบุช่วงเวลาที่ใช้ดึงข้อมูล
func GetAirQualityOneWeek() (map[string]interface{}, error) {
	query := `
        SELECT address, AVG(pm25) AS avg_pm25, AVG(pm10) AS avg_pm10
        FROM sensor_data
        WHERE to_timestamp(timestamp/1000) BETWEEN now() - interval '7 days' AND now()
        GROUP BY address
    `
	data, err := queryAirQuality(query)
	if err != nil {
		return nil, err
	}

	current := time.Now()
	past := current.AddDate(0, 0, -7)

	response := map[string]interface{}{
		"current_date": current,
		"past_date":    past,
		"data":         data,
	}

	return response, nil
}

// ฟังก์ชันช่วยสำหรับ Query (Raw SQL) ผ่าน GORM
func queryAirQuality(query string) ([]map[string]interface{}, error) {
	rows, err := database.DB.Raw(query).Rows()
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	results := []map[string]interface{}{}

	for rows.Next() {
		var address string
		var avgPM25 float64
		var avgPM10 float64

		if err := rows.Scan(&address, &avgPM25, &avgPM10); err != nil {
			return nil, err
		}

		data := map[string]interface{}{
			"address":  address,
			"avg_pm25": avgPM25,
			"avg_pm10": avgPM10,
		}
		results = append(results, data)
	}

	return results, nil
}

// GetProvinceAveragePM25 คำนวณค่าเฉลี่ย PM2.5 ของแต่ละจังหวัด
func GetProvinceAveragePM25() ([]map[string]interface{}, error) {
	query := `
        WITH province_data AS (
            SELECT 
                split_part(address, ' ', array_length(string_to_array(address, ' '), 1)) as province,
                pm25
            FROM sensor_data
            WHERE to_timestamp(timestamp/1000) BETWEEN now() - interval '24 hours' AND now()
        )
        SELECT 
            province,
            ROUND(AVG(pm25)::numeric, 2) as avg_pm25,
            COUNT(*) as station_count
        FROM province_data
        WHERE province != ''
        GROUP BY province
        ORDER BY avg_pm25 DESC
    `

	rows, err := database.DB.Raw(query).Rows()
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	results := []map[string]interface{}{}

	for rows.Next() {
		var province string
		var avgPM25 float64
		var stationCount int

		if err := rows.Scan(&province, &avgPM25, &stationCount); err != nil {
			return nil, err
		}

		data := map[string]interface{}{
			"province":      province,
			"avg_pm25":      avgPM25,
			"station_count": stationCount,
		}
		results = append(results, data)
	}

	return results, nil
}

// GetSensorData7Days ดึงข้อมูล sensor_data ย้อนหลัง 7 วัน
func GetSensorData7Days() ([]models.SensorData, error) {
	var sensorData []models.SensorData

	query := `
		SELECT *
		FROM sensor_data
		WHERE to_timestamp(timestamp/1000) BETWEEN now() - interval '7 days' AND now()
		ORDER BY timestamp DESC
	`

	if err := database.DB.Raw(query).Scan(&sensorData).Error; err != nil {
		return nil, err
	}

	return sensorData, nil
}
