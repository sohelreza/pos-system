# Architecture Documentation

## 1. ERD (Entity Relationship Diagram)

```
+----------------+       +------------------+       +----------------+
|    outlets     |       |   menu_items     |       |  receipt_      |
|----------------|       |------------------|       |  counters      |
| id (PK)        |       | id (PK)          |       |----------------|
| name           |       | name             |       | outlet_id (PK) |
| address        |       | description      |       |   (FK->outlets)|
| created_at     |       | category         |       | last_number    |
+-------+--------+       | base_price       |       +----------------+
        |                | created_at       |
        |                +---------+--------+
        |                          |
        |     +--------------------+--------------------+
        |     |                                         |
        v     v                                         v
+-------+-----+--------+                  +-------------+---------+
|   outlet_menu        |                  |      inventory        |
|----------------------|                  |-----------------------|
| id (PK)              |                  | id (PK)               |
| outlet_id (FK)       |                  | outlet_id (FK)        |
| menu_item_id (FK)    |                  | menu_item_id (FK)     |
| override_price       |                  | stock                 |
| is_active            |                  | UNIQUE(outlet_id,     |
| UNIQUE(outlet_id,    |                  |   menu_item_id)       |
|   menu_item_id)      |                  | CHECK(stock >= 0)     |
+----------------------+                  +-----------------------+
        |
        |
+-------+--------+       +------------------+
|     sales      |       |   sale_items     |
|----------------|       |------------------|
| id (PK)        |<------| id (PK)          |
| outlet_id (FK) |       | sale_id (FK)     |
| receipt_number |       | menu_item_id(FK) |
| total_amount   |       | quantity         |
| created_at     |       | unit_price       |
| UNIQUE(outlet_ |       | subtotal         |
|  id, receipt_  |       +------------------+
|  number)       |
+----------------+
```

### Relationships

- One outlet has many menu assignments (outlet_menu)
- One menu item can be assigned to many outlets (outlet_menu)
- One outlet has one receipt counter
- One outlet has many inventory records
- One outlet has many sales
- One sale has many sale items
- outlet_menu and inventory have composite unique constraints on (outlet_id, menu_item_id)

### Indexes

- `idx_sales_outlet` on sales(outlet_id, created_at) - for sales listing and reporting
- `idx_sale_items_sale` on sale_items(sale_id) - for joining sale items to sales
- `idx_outlet_menu_outlet` on outlet_menu(outlet_id) - for fetching outlet menu
- `idx_inventory_outlet` on inventory(outlet_id) - for fetching outlet inventory

---

## 2. Scaling Plan

### Current State

Single server, single database. Suitable for a few outlets with low transaction volume.

### Target: 10 Outlets, 100,000 transactions/month

#### Database Scaling

**Read Replicas:** Set up one or more read replicas for reporting queries. The reporting endpoints (revenue, top items) are read-heavy and can be offloaded to replicas without affecting write performance on the primary.

**Table Partitioning:** Partition the sales and sale_items tables by outlet_id or by month. At 100k transactions/month, the sales table grows quickly. Partitioning by month allows efficient queries for recent data and easy archival of old partitions.

```sql
-- example: partition sales by month
CREATE TABLE sales (
    id SERIAL,
    outlet_id INTEGER NOT NULL,
    receipt_number VARCHAR(50) NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
) PARTITION BY RANGE (created_at);

CREATE TABLE sales_2026_03 PARTITION OF sales
    FOR VALUES FROM ('2026-03-01') TO ('2026-04-01');
```

**Materialized Views:** For reporting queries that aggregate across many rows, create materialized views that are refreshed periodically (e.g. every 15 minutes). This avoids running expensive aggregations on every report request.

```sql
CREATE MATERIALIZED VIEW outlet_revenue_summary AS
SELECT outlet_id, COUNT(*) as total_sales, SUM(total_amount) as total_revenue
FROM sales
GROUP BY outlet_id;
```

#### Reporting Performance

- Move reporting to read replicas
- Use materialized views for dashboard summaries
- Add date range filters to avoid full table scans

#### Infrastructure

- **Horizontal scaling:** Run multiple backend instances behind a load balancer. The application is stateless so any instance can handle any request.
- **Caching:** Add Redis for caching menu data, outlet info, and report summaries. Menu items and outlet assignments change infrequently, making them ideal cache candidates.
- **Queue system:** For non-critical tasks (e.g. sending receipt emails, updating analytics), use a message queue like RabbitMQ/BullMQ with Redis to process asynchronously.

#### Architectural Evolution

1. **Phase 1 (Current):** Monolith, single DB
2. **Phase 2 (10 outlets):** Add read replica, connection pooling, Redis cache, materialized views
3. **Phase 3 (50+ outlets):** Table partitioning, dedicated reporting DB, message queue for async tasks
4. **Phase 4 (100+ outlets):** Consider microservices split (see section 3), database sharding by region

---

## 3. Conversion to Microservices

### Service Boundaries

The current monolith can be split into these services:

**1. Menu Service**

- Owns: menu_items, outlet_menu tables
- Responsibilities: CRUD for master menu, outlet menu assignments, price overrides
- Why separate: Menu data changes infrequently and is read-heavy. Can be cached aggressively. Doesn't need the same scaling as the sales service.

**2. Inventory Service**

- Owns: inventory table
- Responsibilities: Stock management, stock queries
- Why separate: Inventory updates happen at sale time and during restocking. Needs to be highly available and consistent.

**3. Sales Service**

- Owns: sales, sale_items, receipt_counters tables
- Responsibilities: Processing sales transactions, receipt generation
- Why separate: This is the highest-traffic service. Sales are write-heavy, time-critical, and need strong consistency (receipt numbers, stock deduction). Needs independent scaling.

**4. Reporting Service**

- Owns: Read replicas or materialized views
- Responsibilities: Revenue reports, top items, analytics
- Why separate: Read-heavy, can tolerate slight delays (eventual consistency). Can run expensive queries without affecting the sales flow.

**5. Outlet Service**

- Owns: outlets table
- Responsibilities: Outlet CRUD, outlet configuration
- Why separate: Simple CRUD with low traffic. Could remain part of another service initially.

### Migration Strategy

1. Start by extracting the Reporting service (lowest risk, read-only)
2. Extract Menu service next (low coupling, read-heavy)
3. Extract Sales + Inventory together as one service
4. Split Sales and Inventory later when scale demands it

---

## 4. Offline POS Mode Strategy

### Problem

POS terminals at outlets need to function when internet connectivity to HQ is lost. They should continue processing sales and syncing with HQ when connectivity is restored.

### Architecture

```
[POS Terminal] <--local network--> [KDS (Kitchen Display)]
      |
      |  (local DB - SQLite/IndexedDB)
      |
      v
[Local Queue] ---(when online)---> [HQ Server]
```

### Offline Operation

**Local Data Storage:**
Each POS terminal maintains a local copy of:

- Outlet's assigned menu items and prices (synced from HQ periodically)
- Current inventory levels
- Pending sales queue

**Sales Processing:**

1. POS creates the sale locally against local inventory
2. Sale is added to an outbound sync queue
3. Local inventory is decremented
4. Receipt is printed from local data

### POS to KDS Communication (Offline)

Since POS and KDS are on the same local network:

- POS sends order to KDS directly over LAN
- KDS displays order and manages kitchen workflow
- No dependency on internet for POS-KDS communication

```
POS Terminal ---(LAN)---> KDS Display
```

### Sync Strategy (When Back Online)

**Outbound sync (POS to HQ):**

1. POS detects connectivity restored
2. Sends queued sales to HQ in chronological order
3. HQ validates and processes each sale
4. HQ confirms receipt, POS removes from queue
5. If conflict (e.g. item no longer available), flag for manual review

**Inbound sync (HQ to POS):**

1. HQ sends updated menu items, prices, and inventory adjustments
2. POS replaces local cache with fresh data

### Implementation Considerations

- IndexedDB for local storage in browser-based POS
- SQLite for native POS applications
- Add a sync status indicator on the POS UI (online/offline/syncing)
- Log all sync operations for audit trail
