import pool from "../config/db.js";

export const createSale = async (outletId, items) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // lock and get next receipt number
    const counterResult = await client.query(
      "SELECT last_number FROM receipt_counters WHERE outlet_id = $1 FOR UPDATE",
      [outletId],
    );

    if (counterResult.rows.length === 0) {
      throw { status: 404, message: "Outlet not found or not initialized" };
    }

    const nextNumber = counterResult.rows[0].last_number + 1;
    await client.query(
      "UPDATE receipt_counters SET last_number = $1 WHERE outlet_id = $2",
      [nextNumber, outletId],
    );

    const receiptNumber = `OUT${outletId}-${String(nextNumber).padStart(4, "0")}`;

    let totalAmount = 0;
    const saleItems = [];

    for (const item of items) {
      // get effective price from outlet menu
      const menuResult = await client.query(
        `SELECT COALESCE(om.override_price, mi.base_price) as price
        FROM outlet_menu om
        JOIN menu_items mi ON mi.id = om.menu_item_id
        WHERE om.outlet_id = $1 AND om.menu_item_id = $2 AND om.is_active = true`,
        [outletId, item.menu_item_id],
      );

      if (menuResult.rows.length === 0) {
        throw {
          status: 400,
          message: `Menu item ${item.menu_item_id} is not assigned to this outlet`,
        };
      }

      const unitPrice = parseFloat(menuResult.rows[0].price);
      const subtotal = unitPrice * item.quantity;
      totalAmount += subtotal;

      // check inventory exists
      const stockCheck = await client.query(
        "SELECT stock FROM inventory WHERE outlet_id = $1 AND menu_item_id = $2",
        [outletId, item.menu_item_id],
      );

      if (stockCheck.rows.length === 0) {
        throw {
          status: 400,
          message: `No inventory record for menu item ${item.menu_item_id}. Set stock first.`,
        };
      }

      // deduct inventory
      const inventoryResult = await client.query(
        `UPDATE inventory SET stock = stock - $1
        WHERE outlet_id = $2 AND menu_item_id = $3 AND stock >= $1
        RETURNING *`,
        [item.quantity, outletId, item.menu_item_id],
      );

      if (inventoryResult.rows.length === 0) {
        throw {
          status: 400,
          message: `Insufficient stock for menu item ${item.menu_item_id}`,
        };
      }

      saleItems.push({
        menu_item_id: item.menu_item_id,
        quantity: item.quantity,
        unit_price: unitPrice,
        subtotal,
      });
    }

    // insert sale
    const saleResult = await client.query(
      "INSERT INTO sales (outlet_id, receipt_number, total_amount) VALUES ($1, $2, $3) RETURNING *",
      [outletId, receiptNumber, totalAmount],
    );

    const sale = saleResult.rows[0];

    // insert sale items
    for (const si of saleItems) {
      await client.query(
        "INSERT INTO sale_items (sale_id, menu_item_id, quantity, unit_price, subtotal) VALUES ($1, $2, $3, $4, $5)",
        [sale.id, si.menu_item_id, si.quantity, si.unit_price, si.subtotal],
      );
    }

    await client.query("COMMIT");

    return { ...sale, items: saleItems };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

export const findByOutlet = async (outletId) => {
  const result = await pool.query(
    `SELECT s.*, json_agg(json_build_object(
      'menu_item_id', si.menu_item_id,
      'quantity', si.quantity,
      'unit_price', si.unit_price,
      'subtotal', si.subtotal
    )) as items
    FROM sales s
    JOIN sale_items si ON si.sale_id = s.id
    WHERE s.outlet_id = $1
    GROUP BY s.id
    ORDER BY s.created_at DESC`,
    [outletId],
  );
  return result.rows;
};

export const findById = async (id) => {
  const result = await pool.query(
    `SELECT s.*, json_agg(json_build_object(
      'menu_item_id', si.menu_item_id,
      'quantity', si.quantity,
      'unit_price', si.unit_price,
      'subtotal', si.subtotal
    )) as items
    FROM sales s
    JOIN sale_items si ON si.sale_id = s.id
    WHERE s.id = $1
    GROUP BY s.id`,
    [id],
  );
  return result.rows[0];
};
