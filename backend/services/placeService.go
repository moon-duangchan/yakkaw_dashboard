package services

import (
    "fmt"
    "yakkaw_dashboard/database"
)

type PlaceItem struct {
    Label    string  `json:"label"`
    Address  string  `json:"address"`
    Latitude float64 `json:"latitude"`
    Longitude float64 `json:"longitude"`
    Count    int     `json:"count"`
}

// GetDistinctPlaces returns distinct places (label/address) from sensor_data, optionally filtered by province (address ILIKE)
func GetDistinctPlaces(province string) ([]PlaceItem, error) {
    base := `
        SELECT 
            COALESCE(NULLIF(TRIM(place), ''), address) AS label,
            address,
            MAX(latitude) AS latitude,
            MAX(longitude) AS longitude,
            COUNT(*) AS count
        FROM sensor_data
        %s
        GROUP BY label, address
        ORDER BY count DESC, label ASC
        LIMIT 1000
    `

    var rows []PlaceItem
    if province != "" {
        q := "WHERE address ILIKE ?"
        if err := database.DB.Raw(fmt.Sprintf(base, q), "%"+province+"%").Scan(&rows).Error; err != nil {
            return nil, err
        }
        return rows, nil
    }
    if err := database.DB.Raw(fmt.Sprintf(base, "")).Scan(&rows).Error; err != nil {
        return nil, err
    }
    return rows, nil
}
