# Innocean Bakery — Frontend Client (React 19 + TypeScript + Vite)

Single-Page Application (SPA) client for the Innocean Bakery retail portal built with **React 19**, **TypeScript**, **Vite**, **Tailwind CSS v4**, and **React Router**.

---

## Prerequisites

- **Node.js** >= 18
- **npm**

---

## Setup & Running Locally

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Ensure `VITE_API_BASE_URL` matches your running Laravel backend (default: `http://127.0.0.1:8000/api`):
```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

### 3. Start Development Server
```bash
npm run dev
```
The application will be accessible at **`http://localhost:5173`**.

### 4. Build for Production
```bash
npm run build
```

---

## Application Pages & Routes

- **`/order`** — **Create Order Page:** Input customer name, select an authorized store, and choose from dynamic tier-dependent menu items. Redirects to `/submissions` upon successful creation.
- **`/stores`** — **Store Directory Page:** Live searchable/filterable catalog of all stores with Grid & Table views and an interactive **"View Menu"** modal.
- **`/submissions`** — **Submissions Page:** Live order history table with search, tier filtering, and deletion.
