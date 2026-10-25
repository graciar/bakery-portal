# Innocean Bakery — Retail Order & Store Management Portal

A full-stack retail ordering and tiered inventory allocation platform built with **Laravel (RESTful API & PostgreSQL)** and **React (TypeScript, Tailwind CSS & Vite)**.

---

## Architecture Overview

```
innocean/
├── be/        # Laravel 12 Backend REST API (PHP 8.3+, PostgreSQL, Eloquent)
└── fe/        # React 19 Frontend SPA (TypeScript, Vite, Tailwind CSS v4, React Router)
```

- **Backend (`be/`)**: Handles store locations, tiered catalog management, tier-dependent product availability, customer orders (`submissions`), validation, and database seeding.
- **Frontend (`fe/`)**: Single-Page Application featuring client-side routing (`/entry`, `/stores`, `/submissions`), dynamic store-dependent product menus, real-time filtering, search, and responsive data tables.

---

## Prerequisites

Ensure you have the following installed on your machine:

- **PHP** >= 8.3 & **Composer**
- **Node.js** >= 18 & **npm**
- **PostgreSQL**

---

## 1. Backend Setup (`be`)

### Step 1.1: Navigate to backend directory and install dependencies
```bash
cd be
composer install
```

### Step 1.2: Environment Configuration
Copy the sample environment file and generate the application key:
```bash
cp .env.example .env
php artisan key:generate
```

### Step 1.3: Database Setup
Ensure PostgreSQL is running and create a database named `innocean` (e.g., using `psql`, pgAdmin, or your preferred client):
```sql
CREATE DATABASE innocean;
```

Update your `be/.env` file with your database credentials:
```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=innocean
DB_USERNAME=postgres
DB_PASSWORD=your_password_here
```

### Step 1.4: Run Migrations and Seed Database
Run the database migrations along with the seeders to populate initial tiers, bakery stores, and products:
```bash
php artisan migrate:fresh --seed
```

> **Seed Data Included:**
> - **Tiers:** Tier A, Tier B, Tier C
> - **Stores:** 10 bakery locations across Jakarta, Bandung, Bekasi, Surabaya, Malang, Bali, Medan, and Makassar.
> - **Products:** 15 artisanal breads, pastries, and cakes categorised across Tiers A, B, and C.

### Step 1.5: Start the Backend Server
```bash
php artisan serve
```
The backend API will run on **`http://127.0.0.1:8000`**.

### Step 1.6: Run Tests (Optional)
Run the automated test suite to verify all CRUD endpoints and business rules:
```bash
php artisan test
```

---

## 2. Frontend Setup (`fe`)

### Step 2.1: Open a new terminal, navigate to the frontend directory
```bash
cd fe
```

### Step 2.2: Install NPM Dependencies
```bash
npm install
```

### Step 2.3: Environment Configuration
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Verify that `fe/.env.local` points to your backend URL:
```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

### Step 2.4: Start the Frontend Dev Server
```bash
npm run dev
```
Open your browser and navigate to **`http://localhost:5173`**.

---

## Core Application Pages

| Route | Page | Description |
| :--- | :--- | :--- |
| **`/entry`** | **Data Input Form** | Centered data input form with Name, Store selection, and dynamic tier-dependent Product dropdown. Saves entry directly to PostgreSQL database. |
| **`/stores`** | **Store Directory** | Directory of all bakery stores with search, Tier/Province filters, Grid/Table view toggles, and an interactive **"View Menu"** modal. |
| **`/submissions`** | **Submitted Orders** | Real-time log of customer orders with live search, tier filter, status badges, formatted IDR pricing, and order deletion. |

---

## Backend API Endpoints Reference

All endpoints return standard JSON responses:

### Stores
- `GET /api/stores` — List all stores (supports `search`, `tier_id`, `city`, `province`)
- `POST /api/stores` — Create a new store
- `GET /api/stores/{id}` — Get single store details
- `GET /api/stores/{id}/products` — **Get products authorized for the store's tier**
- `PUT /api/stores/{id}` — Update store
- `DELETE /api/stores/{id}` — Delete store

### Products
- `GET /api/products` — List all products (supports `search`, `tier_id`, `category`)
- `POST /api/products` — Create a product
- `GET /api/products/{id}` — Get product details
- `PUT /api/products/{id}` — Update product
- `DELETE /api/products/{id}` — Delete product

### Submissions / Orders
- `GET /api/submissions` — List all customer order entries (with eager-loaded product, store, and tiers)
- `POST /api/submissions` — Submit a new order (`customer_name`, `store_id`, `product_id`)
- `GET /api/submissions/{id}` — View single order entry
- `DELETE /api/submissions/{id}` — Remove an order entry

### Tiers
- `GET /api/tiers` — List available tiers (Tier A, Tier B, Tier C)
