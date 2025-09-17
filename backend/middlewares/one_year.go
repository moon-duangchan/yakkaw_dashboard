package middleware

import (
	"yakkaw_dashboard/cache"
	"bytes"
	"net/http"
	"time"
    "github.com/didip/tollbooth/v7"
    "github.com/didip/tollbooth_echo"
    "github.com/labstack/echo/v4"
)

// Rate limiter: 30 req/นาที/IP
func RateLimitOneYear(next echo.HandlerFunc) echo.HandlerFunc {
	// Tollbooth v7 ใช้ req/sec
	// 30 req / นาที = 0.5 req / sec
	limiter := tollbooth.NewLimiter(0.5, nil)

	return tollbooth_echo.LimitHandler(limiter)(next)
}

// Cache: เก็บ response 5 นาที
func CacheOneYear(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		key := "one_year:" + c.QueryString()

		// ถ้ามี cache → ส่งกลับเลย
		if val, err := cache.Rdb.Get(cache.Ctx, key).Result(); err == nil {
			return c.JSONBlob(http.StatusOK, []byte(val))
		}

		// intercept response
		res := new(bytes.Buffer)
		resp := c.Response()
		writer := resp.Writer
		resp.Writer = &bodyWriter{ResponseWriter: writer, body: res}
		resp.Writer = writer

		if err := next(c); err != nil {
			return err
		}

		// เก็บลง Redis (expire 5 นาที)
		cache.Rdb.Set(cache.Ctx, key, res.String(), 5*time.Minute)

		return nil
	}
}

type bodyWriter struct {
	http.ResponseWriter
	body *bytes.Buffer
}

func (w *bodyWriter) Write(b []byte) (int, error) {
	w.body.Write(b)
	return w.ResponseWriter.Write(b)
}
