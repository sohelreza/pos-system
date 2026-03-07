import pool from "../config/db.js";

export const findAll = async () => {
  const result = await pool.query(
    "SELECT * FROM outlets ORDER BY created_at DESC",
  );
  return result.rows;
};

export const findById = async (id) => {
  const result = await pool.query("SELECT * FROM outlets WHERE id = $1", [id]);
  return result.rows[0];
};

export const create = async ({ name, address }) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await client.query(
      "INSERT INTO outlets (name, address) VALUES ($1, $2) RETURNING *",
      [name, address],
    );
    const outlet = result.rows[0];

    // initialize receipt counter for this outlet
    await client.query(
      "INSERT INTO receipt_counters (outlet_id, last_number) VALUES ($1, 0)",
      [outlet.id],
    );

    await client.query("COMMIT");
    return outlet;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

export const update = async (id, { name, address }) => {
  const result = await pool.query(
    "UPDATE outlets SET name = $1, address = $2 WHERE id = $3 RETURNING *",
    [name, address, id],
  );
  return result.rows[0];
};

export const remove = async (id) => {
  const result = await pool.query(
    "DELETE FROM outlets WHERE id = $1 RETURNING *",
    [id],
  );
  return result.rows[0];
};
