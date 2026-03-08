import pool from "../config/db.js";

export const findByOutlet = async (outletId) => {
  const result = await pool.query(
    `SELECT i.*, mi.name, mi.category
    FROM inventory i
    JOIN menu_items mi ON mi.id = i.menu_item_id
    WHERE i.outlet_id = $1
    ORDER BY mi.name`,
    [outletId],
  );
  return result.rows;
};

export const getStock = async (outletId, menuItemId) => {
  const result = await pool.query(
    "SELECT * FROM inventory WHERE outlet_id = $1 AND menu_item_id = $2",
    [outletId, menuItemId],
  );
  return result.rows[0];
};

export const setStock = async ({ outlet_id, menu_item_id, stock }) => {
  const result = await pool.query(
    `INSERT INTO inventory (outlet_id, menu_item_id, stock)
    VALUES ($1, $2, $3)
    ON CONFLICT (outlet_id, menu_item_id) DO UPDATE SET stock = $3
    RETURNING *`,
    [outlet_id, menu_item_id, stock],
  );
  return result.rows[0];
};

export const addStock = async (outletId, menuItemId, quantity) => {
  const result = await pool.query(
    `UPDATE inventory SET stock = stock + $1
    WHERE outlet_id = $2 AND menu_item_id = $3
    RETURNING *`,
    [quantity, outletId, menuItemId],
  );
  return result.rows[0];
};
