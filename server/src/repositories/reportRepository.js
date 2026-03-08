import pool from "../config/db.js";

export const getRevenueByOutlet = async (outletId) => {
  const result = await pool.query(
    `SELECT 
      o.id as outlet_id,
      o.name as outlet_name,
      COUNT(s.id) as total_sales,
      COALESCE(SUM(s.total_amount), 0) as total_revenue
    FROM outlets o
    LEFT JOIN sales s ON s.outlet_id = o.id
    WHERE o.id = $1
    GROUP BY o.id`,
    [outletId],
  );
  return result.rows[0];
};

export const getAllOutletsRevenue = async () => {
  const result = await pool.query(
    `SELECT 
      o.id as outlet_id,
      o.name as outlet_name,
      COUNT(s.id) as total_sales,
      COALESCE(SUM(s.total_amount), 0) as total_revenue
    FROM outlets o
    LEFT JOIN sales s ON s.outlet_id = o.id
    GROUP BY o.id
    ORDER BY total_revenue DESC`,
  );
  return result.rows;
};

export const getTopSellingItems = async (outletId, limit = 5) => {
  const result = await pool.query(
    `SELECT 
      mi.id as menu_item_id,
      mi.name,
      mi.category,
      SUM(si.quantity) as total_quantity_sold,
      SUM(si.subtotal) as total_revenue
    FROM sale_items si
    JOIN sales s ON s.id = si.sale_id
    JOIN menu_items mi ON mi.id = si.menu_item_id
    WHERE s.outlet_id = $1
    GROUP BY mi.id
    ORDER BY total_quantity_sold DESC
    LIMIT $2`,
    [outletId, limit],
  );
  return result.rows;
};
