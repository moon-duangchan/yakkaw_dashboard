package controllers

import "net/http"

// configureAuthCookie enforces secure defaults for cross-site cookie usage.
func configureAuthCookie(cookie *http.Cookie) {
	cookie.HttpOnly = true
	cookie.Secure = true
	cookie.SameSite = http.SameSiteNoneMode
	if cookie.Path == "" {
		cookie.Path = "/"
	}
}
