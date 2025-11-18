# Yakkaw Dashboard

## Overview
Yakkaw Dashboard is a web-based dashboard application built using **Go (Echo Framework)**, **PostgreSQL**, and **Bun ORM**. It provides a modern and efficient solution for managing and visualizing data with a scalable architecture.

## Features
- Built with **Go** using the **Echo framework** for high-performance web applications.
- Utilizes **PostgreSQL** as the primary database.
- **Bun ORM** for efficient database management and queries.
- RESTful API for seamless frontend-backend communication.
- Middleware for authentication and request handling.
- Scalable architecture suitable for production deployment.

## Technologies Used
- **Go** (Echo Framework)
- **PostgreSQL**
- **Bun ORM**
- **Docker** (optional, for deployment)
- **Bun Migrations** for database schema management

## Installation
### Prerequisites
Make sure you have the following installed:
- [Go](https://go.dev/dl/)
- [PostgreSQL](https://www.postgresql.org/download/)
- [Bun ORM](https://bun.uptrace.dev/)

### Clone the Repository
```sh
git clone https://github.com/MABiuS1/yakkaw-dashboard.git
cd yakkaw-dashboard
```

### Install Dependencies
```sh
go mod tidy
```

### Configure Environment Variables
Copy the sample file and adjust the values for your environment (including any ngrok domain you plan to expose):
```sh
cp .env.example .env
```

At minimum set the database credentials plus:
```env
SERVER_PORT=8080
FRONTEND_ORIGINS=http://localhost:3000,https://your-ngrok-domain.ngrok.io
JWT_SECRET=replace-with-strong-secret
API_URL=https://yakkaw.mfu.ac.th/api/yakkaw/devices
QR_CONSUME_BASE_URL=http://localhost:8080
QR_DEFAULT_REDIRECT=http://localhost:3000/qr-create-device
```

### Run Database Migrations
```sh
go run cmd/migrate/main.go up
```

### Start the Server
```sh
go run main.go
```
The server will be running at `http://localhost:8080`.

## API Endpoints
### Public Routes
| Method | Endpoint           | Description |
|--------|-------------------|-------------|
| POST   | `/register`       | User registration |
| POST   | `/login`          | User login |
| GET    | `/sponsors`       | Get list of sponsors |
| GET    | `/notifications`  | Get all notifications |
| GET    | `/me`             | Get logged-in user info |

### Admin Routes (Protected by JWT Middleware)
| Method | Endpoint                     | Description |
|--------|-----------------------------|-------------|
| GET    | `/admin/dashboard`          | Admin dashboard |
| POST   | `/admin/notifications`      | Create a notification |
| PUT    | `/admin/notifications/:id`  | Update a notification |
| DELETE | `/admin/notifications/:id`  | Delete a notification |
| POST   | `/admin/sponsors`           | Create a sponsor |
| PUT    | `/admin/sponsors/:id`       | Update a sponsor |
| DELETE | `/admin/sponsors/:id`       | Delete a sponsor |

## API Usage Examples
The snippets below assume the server runs on `http://localhost:8080`.

### Login with curl
Authenticate once and store the issued JWT cookie for subsequent admin calls:

```bash
curl -i -X POST http://localhost:8080/login \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'username=admin' \
  -d 'password=admin-password' \
  -c cookies.txt
```

- Replace `admin` / `admin-password` with your credentials.
- The `-c cookies.txt` flag saves the `access_token` cookie, which is required when calling `/admin/...` endpoints.

### Color Range Reference
Color ranges recommended for PM2.5 values:

| Min | Max | Hex Color |
|-----|-----|-----------|
| 91  | 500 | `#FF2C2C` |
| 51  | 90  | `#F26B0F` |
| 38  | 50  | `#FECC17` |
| 26  | 37  | `#46DA01` |
| 0   | 25  | `#2EA8FF` |

To create a color range (repeat for each row above):

```bash
curl -X POST http://localhost:8080/admin/colorranges \
  -H 'Content-Type: application/json' \
  -b cookies.txt \
  -d '{
    "min": 91,
    "max": 500,
    "color": "#FF2C2C"
  }'
```

- The saved cookie from the login step is reused via `-b cookies.txt`.
- Update the `min`, `max`, and `color` payload for the remaining range entries.

### Example: Add News Item
The payload mirrors the `models.News` structure (title, description, image, url, date, category_id).

```bash
curl -X POST http://localhost:8080/admin/news \
  -H 'Content-Type: application/json' \
  -b cookies.txt \
  -d '{
    "title": "PM2.5 Alert Level Raised",
    "description": "Provincial officers have issued a warning for high PM2.5 levels this week.",
    "image": "https://example.com/images/pm25-alert.png",
    "url": "https://example.com/news/pm25-alert",
    "date": "2024-06-01T09:00:00Z",
    "category_id": 1
  }'
```

- `category_id` must reference an existing category.
- Omit `date` to default to the API server time.

## Running with Docker (Optional)
### Build and Run Docker Containers
```sh
docker-compose up --build
```

## Contribution
1. Fork the repository
2. Create a new branch (`git checkout -b feature-branch`)
3. Commit your changes (`git commit -m 'Add new feature'`)
4. Push to the branch (`git push origin feature-branch`)
5. Create a Pull Request

## License
This project is licensed under the MIT License.

## Contact
For any questions or inquiries, feel free to contact me via GitHub Issues or email.
