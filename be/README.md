# Innocean Bakery — Backend API (Laravel 12)

RESTful backend service for the Innocean Bakery retail portal built with **Laravel 12**, **PHP 8.3+**, and **PostgreSQL**.

---

## Prerequisites

- **PHP** >= 8.3
- **Composer**
- **PostgreSQL**

---

## Setup & Installation

### 1. Install Dependencies
```bash
composer install
```

### 2. Environment Configuration
```bash
cp .env.example .env
php artisan key:generate
```

Configure your PostgreSQL database connection in `.env`:
```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=innocean
DB_USERNAME=postgres
DB_PASSWORD=your_password_here
```

### 3. Database Migration & Seeding
Run migrations and populate seed data (tiers, stores, and products):
```bash
php artisan migrate:fresh --seed
```

### 4. Start Development Server
```bash
php artisan serve
```
The server will start at **`http://127.0.0.1:8000`**.

### 5. Run Test Suite
```bash
php artisan test
```

---

## API Endpoints Summary

- **Stores:** `GET /api/stores`, `POST /api/stores`, `GET /api/stores/{id}`, `GET /api/stores/{id}/products`, `PUT /api/stores/{id}`, `DELETE /api/stores/{id}`
- **Products:** `GET /api/products`, `POST /api/products`, `GET /api/products/{id}`, `PUT /api/products/{id}`, `DELETE /api/products/{id}`
- **Submissions:** `GET /api/submissions`, `POST /api/submissions`, `DELETE /api/submissions/{id}`
- **Tiers:** `GET /api/tiers`
