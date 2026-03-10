import { useEffect, useState } from "react";
import api from "../lib/api";
import { formatPrice } from "../lib/config";

export default function Reports() {
  const [revenue, setRevenue] = useState([]);
  const [outlets, setOutlets] = useState([]);
  const [selectedOutlet, setSelectedOutlet] = useState("");
  const [topItems, setTopItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRevenue = async () => {
      try {
        const [revRes, outRes] = await Promise.all([
          api.get("/reports/revenue"),
          api.get("/outlets"),
        ]);
        setRevenue(revRes.data);
        setOutlets(outRes.data);
      } catch (err) {
      } finally {
        setLoading(false);
      }
    };
    fetchRevenue();
  }, []);

  useEffect(() => {
    if (!selectedOutlet) {
      setTopItems([]);
      return;
    }
    const fetchTopItems = async () => {
      try {
        const res = await api.get(`/reports/top-items/${selectedOutlet}`);
        setTopItems(res.data);
      } catch (err) {}
    };
    fetchTopItems();
  }, [selectedOutlet]);

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
      <h2 className="text-xl font-semibold mb-4">Reports</h2>

      {/* Summary cards */}
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

      {/* Revenue by outlet */}
      <div className="mb-6">
        <h3 className="font-medium mb-3">Revenue by Outlet</h3>
        <div className="bg-white rounded shadow-sm border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left p-3">Outlet</th>
                <th className="text-left p-3">Total Sales</th>
                <th className="text-left p-3">Total Revenue</th>
              </tr>
            </thead>
            <tbody>
              {revenue.map((r) => (
                <tr key={r.outlet_id} className="border-b">
                  <td className="p-3">{r.outlet_name}</td>
                  <td className="p-3">{r.total_sales}</td>
                  <td className="p-3">{formatPrice(r.total_revenue)}</td>
                </tr>
              ))}
              {revenue.length === 0 && (
                <tr>
                  <td colSpan="3" className="p-3 text-gray-500 text-center">
                    No data yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top items per outlet */}
      <div>
        <h3 className="font-medium mb-3">Top 5 Selling Items</h3>
        <div className="mb-3">
          <select
            value={selectedOutlet}
            onChange={(e) => setSelectedOutlet(e.target.value)}
            className="border rounded px-3 py-2 text-sm"
          >
            <option value="">Select Outlet</option>
            {outlets.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
        </div>

        {selectedOutlet && (
          <div className="bg-white rounded shadow-sm border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left p-3">#</th>
                  <th className="text-left p-3">Item</th>
                  <th className="text-left p-3">Category</th>
                  <th className="text-left p-3">Qty Sold</th>
                  <th className="text-left p-3">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {topItems.map((item, index) => (
                  <tr key={item.menu_item_id} className="border-b">
                    <td className="p-3">{index + 1}</td>
                    <td className="p-3">{item.name}</td>
                    <td className="p-3">{item.category || "-"}</td>
                    <td className="p-3">{item.total_quantity_sold}</td>
                    <td className="p-3">{formatPrice(item.total_revenue)}</td>
                  </tr>
                ))}
                {topItems.length === 0 && (
                  <tr>
                    <td colSpan="5" className="p-3 text-gray-500 text-center">
                      No sales data for this outlet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
