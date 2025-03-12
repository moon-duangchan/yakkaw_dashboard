package utils

import (
    "github.com/sirupsen/logrus"
)

var log = logrus.New()

func SetupLogger() {
    log.SetFormatter(&logrus.TextFormatter{FullTimestamp: true})
    log.SetLevel(logrus.InfoLevel)
}

func GetLogger() *logrus.Logger {
    return log
}
