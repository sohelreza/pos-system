import pool from "../config/db.js";

const migrate = async () => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // outlets table
    await client.query(`
      CREATE TABLE IF NOT EXISTS outlets (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        address TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // menu items - master menu managed by HQ
    await client.query(`
      CREATE TABLE IF NOT EXISTS menu_items (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(100),
        base_price DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // outlet menu assignments with optional price override
    await client.query(`
      CREATE TABLE IF NOT EXISTS outlet_menu (
        id SERIAL PRIMARY KEY,
        outlet_id INTEGER NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
        menu_item_id INTEGER NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
        override_price DECIMAL(10, 2),
        is_active BOOLEAN DEFAULT true,
        UNIQUE(outlet_id, menu_item_id)
      );
    `);

    // inventory per outlet per menu item
    await client.query(`
      CREATE TABLE IF NOT EXISTS inventory (
        id SERIAL PRIMARY KEY,
        outlet_id INTEGER NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
        menu_item_id INTEGER NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
        stock INTEGER NOT NULL DEFAULT 0,
        UNIQUE(outlet_id, menu_item_id),
        CONSTRAINT stock_non_negative CHECK (stock >= 0)
      );
    `);

    // sales transactions
    await client.query(`
      CREATE TABLE IF NOT EXISTS sales (
        id SERIAL PRIMARY KEY,
        outlet_id INTEGER NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
        receipt_number VARCHAR(50) NOT NULL,
        total_amount DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(outlet_id, receipt_number)
      );
    `);

    // individual items in a sale
    await client.query(`
      CREATE TABLE IF NOT EXISTS sale_items (
        id SERIAL PRIMARY KEY,
        sale_id INTEGER NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
        menu_item_id INTEGER NOT NULL REFERENCES menu_items(id),
        quantity INTEGER NOT NULL,
        unit_price DECIMAL(10, 2) NOT NULL,
        subtotal DECIMAL(10, 2) NOT NULL
      );
    `);

    // indexes for frequently queried fields
    await client.query(
      `CREATE INDEX IF NOT EXISTS idx_sales_outlet ON sales(outlet_id, created_at);`,
    );
    await client.query(
      `CREATE INDEX IF NOT EXISTS idx_sale_items_sale ON sale_items(sale_id);`,
    );
    await client.query(
      `CREATE INDEX IF NOT EXISTS idx_outlet_menu_outlet ON outlet_menu(outlet_id);`,
    );
    await client.query(
      `CREATE INDEX IF NOT EXISTS idx_inventory_outlet ON inventory(outlet_id);`,
    );

    // receipt counter table for sequential receipt numbers
    await client.query(`
      CREATE TABLE IF NOT EXISTS receipt_counters (
        outlet_id INTEGER PRIMARY KEY REFERENCES outlets(id) ON DELETE CASCADE,
        last_number INTEGER NOT NULL DEFAULT 0
      );
    `);

    await client.query("COMMIT");
    console.log("Migration completed successfully");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Migration failed:", err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
};

migrate();
