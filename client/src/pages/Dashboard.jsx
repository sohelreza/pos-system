import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";
import { formatPrice } from "../lib/config";

export default function Dashboard() {
  const [revenue, setRevenue] = useState([]);
  const [outlets, setOutlets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [revRes, outRes] = await Promise.all([
          api.get("/reports/revenue"),
          api.get("/outlets"),
        ]);
        setRevenue(revRes.data);
        setOutlets(outRes.data);
      } catch (err) {
        console.log("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalRevenue = revenue.reduce(
    (sum, r) => sum + parseFloat(r.total_revenue),
    0,
  );
  const totalSales = revenue.reduce(
    (sum, r) => sum + parseInt(r.total_sales),
    0,
  );

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Dashboard</h2>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow-sm border">
          <div className="text-gray-500 text-sm">Total Revenue</div>
          <div className="text-2xl font-semibold mt-1">
            {formatPrice(totalRevenue)}
          </div>
        </div>
        <div className="bg-white p-4 rounded shadow-sm border">
          <div className="text-gray-500 text-sm">Total Sales</div>
          <div className="text-2xl font-semibold mt-1">{totalSales}</div>
        </div>
        <div className="bg-white p-4 rounded shadow-sm border">
          <div className="text-gray-500 text-sm">Active Outlets</div>
          <div className="text-2xl font-semibold mt-1">{outlets.length}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Link
          to="/sales"
          className="p-4 bg-white rounded shadow-sm border hover:bg-gray-50"
        >
          <h3 className="font-medium">New Sale</h3>
          <p className="text-gray-500 text-sm mt-1">
            Process a new sales transaction
          </p>
        </Link>
        <Link
          to="/menu-items"
          className="p-4 bg-white rounded shadow-sm border hover:bg-gray-50"
        >
          <h3 className="font-medium">Manage Menu</h3>
          <p className="text-gray-500 text-sm mt-1">
            Add or edit master menu items
          </p>
        </Link>
        <Link
          to="/inventory"
          className="p-4 bg-white rounded shadow-sm border hover:bg-gray-50"
        >
          <h3 className="font-medium">Inventory</h3>
          <p className="text-gray-500 text-sm mt-1">
            Check and update stock levels
          </p>
        </Link>
        <Link
          to="/reports"
          className="p-4 bg-white rounded shadow-sm border hover:bg-gray-50"
        >
          <h3 className="font-medium">Reports</h3>
          <p className="text-gray-500 text-sm mt-1">
            View revenue and top selling items
          </p>
        </Link>
      </div>
    </div>
  );
}
