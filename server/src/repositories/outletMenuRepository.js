import pool from "../config/db.js";

export const findByOutlet = async (outletId) => {
  const result = await pool.query(
    `SELECT om.*, mi.name, mi.description, mi.category, mi.base_price,
      COALESCE(om.override_price, mi.base_price) as effective_price
    FROM outlet_menu om
    JOIN menu_items mi ON mi.id = om.menu_item_id
    WHERE om.outlet_id = $1 AND om.is_active = true
    ORDER BY mi.name`,
    [outletId],
  );
  return result.rows;
};

export const assign = async ({ outlet_id, menu_item_id, override_price }) => {
  const result = await pool.query(
    `INSERT INTO outlet_menu (outlet_id, menu_item_id, override_price),m
    VALUES ($1, $2, $3)
    ON CONFLICT (outlet_id, menu_item_id) DO UPDATE SET override_price = $3, is_active = true
    RETURNING *`,
    [outlet_id, menu_item_id, override_price || null],
  );
  return result.rows[0];
};

export const unassign = async (outletId, menuItemId) => {
  const result = await pool.query(
    "UPDATE outlet_menu SET is_active = false WHERE outlet_id = $1 AND menu_item_id = $2 RETURNING *",
    [outletId, menuItemId],
  );
  return result.rows[0];
};

export const updatePrice = async (outletId, menuItemId, overridePrice) => {
  const result = await pool.query(
    "UPDATE outlet_menu SET override_price = $1 WHERE outlet_id = $2 AND menu_item_id = $3 RETURNING *",
    [overridePrice, outletId, menuItemId],
  );
  return result.rows[0];
};
