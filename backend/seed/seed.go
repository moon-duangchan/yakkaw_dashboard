package seed

import (
	"errors"
	"fmt"
	"os"
	"strings"

	"yakkaw_dashboard/models"
	"yakkaw_dashboard/utils"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

const (
	envAdminUsername = "ADMIN_USERNAME"
	envAdminPassword = "ADMIN_PASSWORD"
	envSkipSeed      = "SKIP_DB_SEED"
)

// Run executes idempotent database seeding that is safe to run in production containers.
// It skips when the admin user already exists or when SKIP_DB_SEED is set.
func Run(db *gorm.DB) error {
	logger := utils.GetLogger()

	if shouldSkipSeeding() {
		logger.Info("database seeding skipped because SKIP_DB_SEED is set")
		return nil
	}

	logger.Info("starting database seeding")

	username := strings.TrimSpace(os.Getenv(envAdminUsername))
	if username == "" {
		return fmt.Errorf("%s must be set to seed an admin user", envAdminUsername)
	}

	var user models.User
	err := db.Where("username = ?", username).First(&user).Error
	if err == nil {
		logger.Infof("admin user %q already exists; skipping seeding", username)
		return nil
	}
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return fmt.Errorf("check existing admin user: %w", err)
	}

	password := strings.TrimSpace(os.Getenv(envAdminPassword))
	if password == "" {
		return fmt.Errorf("%s must be set to seed an admin user", envAdminPassword)
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return fmt.Errorf("hash admin password: %w", err)
	}

	admin := models.User{
		Username: username,
		Password: string(hashedPassword),
		Role:     "admin",
	}

	if err := db.Create(&admin).Error; err != nil {
		return fmt.Errorf("create admin user: %w", err)
	}

	logger.Infof("seeded admin user %q", adminUsername)
	return nil
}

func shouldSkipSeeding() bool {
	flag := strings.TrimSpace(os.Getenv(envSkipSeed))
	if flag == "" {
		return false
	}

	flag = strings.ToLower(flag)
	return flag == "1" || flag == "true" || flag == "yes" || flag == "on"
}
