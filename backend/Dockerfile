# ใช้ Go เวอร์ชั่นล่าสุดเป็น base image
FROM golang:latest

# กำหนด working directory ภายใน container
WORKDIR /app

# คัดลอกไฟล์ go.mod และ go.sum เพื่อดาวน์โหลด dependencies
COPY go.mod go.sum ./

# ดาวน์โหลด dependencies ของโปรเจกต์
RUN go mod download

# คัดลอกซอร์สโค้ดทั้งหมดมาไว้ใน container
COPY . .

# สร้าง executable binary
RUN go build -o main .

# กำหนด environment variables
ENV DB_HOST=postgres_db
ENV DB_PORT=5432
ENV DB_USER=yakkaw
ENV DB_PASSWORD=1234
ENV DB_NAME=yakkaw_db
ENV SERVER_PORT=8080

# เปิดเผยพอร์ตที่แอปพลิเคชัน Go ใช้
EXPOSE 8080

# คำสั่งสำหรับรันแอปพลิเคชัน
CMD ["./main"]