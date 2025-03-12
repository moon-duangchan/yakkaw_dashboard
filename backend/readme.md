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
Create a `.env` file in the project root and set the following variables:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_user
DB_PASSWORD=your_password
DB_NAME=yakkaw_db
SERVER_PORT=8080
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