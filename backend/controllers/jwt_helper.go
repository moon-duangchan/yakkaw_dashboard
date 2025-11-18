package controllers

import "yakkaw_dashboard/config"

// getJWTSecret exposes the configured JWT secret for controllers.
func getJWTSecret() []byte {
	return []byte(config.Get().JWTSecret)
}
