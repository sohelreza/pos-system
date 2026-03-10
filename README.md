# POS System

HQ management system for F&B outlets. Manages master menu, assigns menu items to outlets, tracks inventory, processes sales transactions, and generates reports.

## Tech Stack

- **Backend:** Node.js, Express.js, PostgreSQL
- **Frontend:** React 19, Vite, Tailwind CSS
- **Infrastructure:** Docker, docker-compose, Render

## Architecture

The backend follows a layered architecture:

```
routes -> controllers -> services -> repositories -> database
```

- **Routes** define API endpoints and attach validation middleware
- **Controllers** handle HTTP request/response
- **Services** contain business logic
- **Repositories** handle database queries

## Database Schema

### Tables

- **outlets** - Store locations managed by HQ
- **menu_items** - Master menu catalog with base prices
- **outlet_menu** - Maps menu items to outlets with optional price overrides
- **inventory** - Stock tracking per outlet per menu item (CHECK constraint prevents negative stock)
- **sales** - Sale transactions with sequential receipt numbers per outlet
- **sale_items** - Individual items within a sale
- **receipt_counters** - Tracks last receipt number per outlet for concurrency-safe sequential generation

### Key Constraints

- `UNIQUE(outlet_id, menu_item_id)` on outlet_menu and inventory
- `CHECK (stock >= 0)` on inventory
- `UNIQUE(outlet_id, receipt_number)` on sales
- Foreign keys with `ON DELETE CASCADE`

### Concurrency

Receipt numbers are generated using `SELECT ... FOR UPDATE` on the receipt_counters table within a database transaction. This ensures sequential, gapless receipt numbers even under concurrent requests.

## Setup

### Prerequisites

- Node.js 20+
- PostgreSQL 16 (or Docker)

### Local Development

1. Clone the repo

```bash
git clone https://github.com/sohelreza/pos-system.git
cd pos-system
```

2. Setup backend

```bash
cd server
cp .env.example .env
# update .env with your database credentials
npm install
npm run migrate
npm run dev
```

3. Setup frontend

```bash
cd client
cp .env.example .env
npm install
npm run dev
```

Backend runs on `http://localhost:5000`, frontend on `http://localhost:3000`.

### Docker

```bash
docker-compose up --build
```

Then run migration:

```bash
docker-compose exec server node src/db/migrate.js
```

App available at `http://localhost:3000`.

## API Endpoints

### Menu Items

- `GET /api/menu-items` - List all menu items
- `GET /api/menu-items/:id` - Get single item
- `POST /api/menu-items` - Create item
- `PUT /api/menu-items/:id` - Update item
- `DELETE /api/menu-items/:id` - Delete item

### Outlets

- `GET /api/outlets` - List all outlets
- `GET /api/outlets/:id` - Get single outlet
- `POST /api/outlets` - Create outlet
- `PUT /api/outlets/:id` - Update outlet
- `DELETE /api/outlets/:id` - Delete outlet

### Outlet Menu

- `GET /api/outlets/:outletId/menu` - Get outlet's assigned menu
- `POST /api/outlets/:outletId/menu` - Assign menu item to outlet
- `DELETE /api/outlets/:outletId/menu/:menuItemId` - Unassign item
- `PATCH /api/outlets/:outletId/menu/:menuItemId/price` - Update override price

### Inventory

- `GET /api/outlets/:outletId/inventory` - Get outlet inventory
- `GET /api/outlets/:outletId/inventory/:menuItemId` - Get specific item stock
- `POST /api/outlets/:outletId/inventory` - Set stock
- `PATCH /api/outlets/:outletId/inventory/:menuItemId` - Add stock

### Sales

- `POST /api/outlets/:outletId/sales` - Create sale
- `GET /api/outlets/:outletId/sales` - List outlet sales
- `GET /api/outlets/:outletId/sales/:id` - Get sale details

### Reports

- `GET /api/reports/revenue` - All outlets revenue
- `GET /api/reports/revenue/:outletId` - Single outlet revenue
- `GET /api/reports/top-items/:outletId` - Top 5 selling items

## Improvements

Things I would add with more time:

- Price override UI on frontend
- Pagination for sales list and menu items
- Date range filter on reports
- Better error notifications (toast instead of alert)
- Unit tests for critical paths (sales transaction, inventory deduction)
- Rate limiting on API
- Authentication and role-based access (HQ admin vs outlet staff)
- Seed script for demo data
