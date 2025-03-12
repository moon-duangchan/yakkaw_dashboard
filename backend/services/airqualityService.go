package services

import (
	"encoding/json"
	"io/ioutil"
	"log"
	"net/http"

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

// ------------------------------------
// ตัวอย่างฟังก์ชัน Query ข้อมูลเฉลี่ยตามช่วงเวลา (Raw SQL ผ่าน GORM)
// ------------------------------------

// GetAirQualityOneWeek ค่าเฉลี่ย 1 สัปดาห์
func GetAirQualityOneWeek() ([]map[string]interface{}, error) {
	query := `
        SELECT address, AVG(pm25) AS avg_pm25, AVG(pm10) AS avg_pm10
        FROM sensor_data
        WHERE to_timestamp(timestamp/1000) >= now() - interval '7 days'
        GROUP BY address
    `
	return queryAirQuality(query)
}

func GetAirQualityOneMonth() ([]map[string]interface{}, error) {
	query := `
        SELECT address, AVG(pm25) AS avg_pm25, AVG(pm10) AS avg_pm10
        FROM sensor_data
        WHERE to_timestamp(timestamp/1000) >= now() - interval '1 month'
        GROUP BY address
    `
	return queryAirQuality(query)
}

func GetAirQualityThreeMonths() ([]map[string]interface{}, error) {
	query := `
        SELECT address, AVG(pm25) AS avg_pm25, AVG(pm10) AS avg_pm10
        FROM sensor_data
        WHERE to_timestamp(timestamp/1000) >= now() - interval '3 months'
        GROUP BY address
    `
	return queryAirQuality(query)
}

func GetAirQualityOneYear() ([]map[string]interface{}, error) {
	query := `
        SELECT address, AVG(pm25) AS avg_pm25, AVG(pm10) AS avg_pm10
        FROM sensor_data
        WHERE to_timestamp(timestamp/1000) >= now() - interval '1 year'
        GROUP BY address
    `
	return queryAirQuality(query)
}

// ------------------------------------
// ฟังก์ชันช่วยสำหรับ Query (Raw SQL) ผ่าน GORM
// ------------------------------------
func queryAirQuality(query string) ([]map[string]interface{}, error) {
	// 1) เรียก Raw(...) เพื่อดึง *sql.Rows
	rows, err := database.DB.Raw(query).Rows()
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	results := []map[string]interface{}{}

	// 2) สแกนค่าจาก rows (แบบเดียวกับ database/sql)
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
