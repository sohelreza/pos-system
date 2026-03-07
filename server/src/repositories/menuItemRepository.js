import pool from "../config/db.js";

export const findAll = async () => {
  const result = await pool.query(
    "SELECT * FROM menu_items ORDER BY created_at DESC",
  );
  return result.rows;
};

export const findById = async (id) => {
  const result = await pool.query("SELECT * FROM menu_items WHERE id = $1", [
    id,
  ]);
  return result.rows[0];
};

export const create = async ({ name, description, category, base_price }) => {
  const result = await pool.query(
    "INSERT INTO menu_items (name, description, category, base_price) VALUES ($1, $2, $3, $4) RETURNING *",
    [name, description, category, base_price],
  );
  return result.rows[0];
};

export const update = async (
  id,
  { name, description, category, base_price },
) => {
  const result = await pool.query(
    "UPDATE menu_items SET name = $1, description = $2, category = $3, base_price = $4 WHERE id = $5 RETURNING *",
    [name, description, category, base_price, id],
  );
  return result.rows[0];
};

export const remove = async (id) => {
  const result = await pool.query(
    "DELETE FROM menu_items WHERE id = $1 RETURNING *",
    [id],
  );
  return result.rows[0];
};
