package models

type SensorData struct {
	ID           uint   `gorm:"primaryKey"`
	DVID         string `gorm:"column:dvid;size:10" json:"dvid"`
	DeviceID     string `gorm:"column:deviceid;size:20" json:"deviceid"`
	Status       string `gorm:"column:status;size:20" json:"status"`
	Latitude     float64 `gorm:"column:latitude" json:"latitude"`
	Longitude    float64 `gorm:"column:longitude" json:"longitude"`
	Place        string  `gorm:"column:place;type:text" json:"place"`
	Address      string  `gorm:"column:address;type:text" json:"address"`
	Model        string  `gorm:"column:model;size:50" json:"model"`
	DeployDate   string  `gorm:"column:deploydate;size:50" json:"deploydate"`
	ContactName  string  `gorm:"column:contactname;size:50" json:"contactname"`
	ContactPhone string  `gorm:"column:contactphone;size:20" json:"contactphone"`
	Note         string  `gorm:"column:note;type:text" json:"note"`
	DDate        string  `gorm:"column:ddate;size:50" json:"ddate"`
	DTime        string  `gorm:"column:dtime;size:50" json:"dtime"`
	Timestamp    int64   `gorm:"column:timestamp" json:"timestamp"`
	Av24h        int     `gorm:"column:av24h" json:"av24h"`
	Av12h        int     `gorm:"column:av12h" json:"av12h"`
	Av6h         int     `gorm:"column:av6h" json:"av6h"`
	Av3h         int     `gorm:"column:av3h" json:"av3h"`
	Av1h         int     `gorm:"column:av1h" json:"av1h"`
	PM25         int     `gorm:"column:pm25" json:"pm25"`
	PM10         int     `gorm:"column:pm10" json:"pm10"`
	PM100        int     `gorm:"column:pm100" json:"pm100"`
	AQI          int     `gorm:"column:aqi" json:"aqi"`
	Temperature  int     `gorm:"column:temperature" json:"temperature"`
	Humidity     int     `gorm:"column:humidity" json:"humidity"`
	Pres         int     `gorm:"column:pres" json:"pres"`
	Color        string  `gorm:"column:color;size:5" json:"color"`
	Trend        string  `gorm:"column:trend;size:5" json:"trend"`
}



type APIResponse struct {
    Status   int             `json:"status" gorm:"-"`
    Error    interface{}     `json:"error" gorm:"-"`
    Response []SensorData    `json:"response" gorm:"-"`
}
