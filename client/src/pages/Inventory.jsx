import { useEffect, useState } from "react";
import api from "../lib/api";

export default function Inventory() {
  const [outlets, setOutlets] = useState([]);
  const [selectedOutlet, setSelectedOutlet] = useState("");
  const [inventory, setInventory] = useState([]);
  const [outletMenu, setOutletMenu] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ menu_item_id: "", stock: "" });

  useEffect(() => {
    const fetchOutlets = async () => {
      try {
        const res = await api.get("/outlets");
        setOutlets(res.data);
      } catch (err) {
        console.log("Failed to fetch outlets");
      }
    };
    fetchOutlets();
  }, []);

  const fetchInventory = async (outletId) => {
    if (!outletId) return;
    setLoading(true);
    try {
      const [invRes, menuRes] = await Promise.all([
        api.get(`/outlets/${outletId}/inventory`),
        api.get(`/outlets/${outletId}/menu`),
      ]);
      setInventory(invRes.data);
      setOutletMenu(menuRes.data);
    } catch (err) {
      console.log("Failed to fetch inventory");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedOutlet) {
      fetchInventory(selectedOutlet);
    } else {
      setInventory([]);
      setOutletMenu([]);
    }
  }, [selectedOutlet]);

  const handleSetStock = async (e) => {
    e.preventDefault();
    if (!selectedOutlet || !form.menu_item_id) return;
    try {
      await api.post(`/outlets/${selectedOutlet}/inventory`, {
        menu_item_id: parseInt(form.menu_item_id),
        stock: parseInt(form.stock),
      });
      setForm({ menu_item_id: "", stock: "" });
      fetchInventory(selectedOutlet);
    } catch (err) {
      alert(err.response?.data?.error || "Failed to set stock");
    }
  };

  const handleAddStock = async (menuItemId) => {
    const qty = prompt("Enter quantity to add:");
    if (!qty || isNaN(qty)) return;
    try {
      await api.patch(`/outlets/${selectedOutlet}/inventory/${menuItemId}`, {
        quantity: parseInt(qty),
      });
      fetchInventory(selectedOutlet);
    } catch (err) {
      alert(err.response?.data?.error || "Failed to add stock");
    }
  };

  // items assigned to outlet but not yet in inventory
  const inventoryItemIds = inventory.map((i) => i.menu_item_id);
  const unstockedItems = outletMenu.filter(
    (m) => !inventoryItemIds.includes(m.menu_item_id),
  );

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Inventory</h2>

      <div className="mb-4">
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
        <>
          {unstockedItems.length > 0 && (
            <form
              onSubmit={handleSetStock}
              className="mb-6 p-4 bg-white rounded shadow-sm border"
            >
              <h3 className="font-medium mb-3">Set Initial Stock</h3>
              <div className="flex gap-3">
                <select
                  value={form.menu_item_id}
                  onChange={(e) =>
                    setForm({ ...form, menu_item_id: e.target.value })
                  }
                  className="border rounded px-3 py-2 text-sm flex-1"
                  required
                >
                  <option value="">Select Item</option>
                  {unstockedItems.map((item) => (
                    <option key={item.menu_item_id} value={item.menu_item_id}>
                      {item.name}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="Stock qty"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  className="border rounded px-3 py-2 text-sm w-32"
                  min="0"
                  required
                />
                <button
                  type="submit"
                  className="bg-gray-900 text-white px-4 py-2 rounded text-sm"
                >
                  Set Stock
                </button>
              </div>
            </form>
          )}

          {loading ? (
            <p>Loading...</p>
          ) : (
            <div className="bg-white rounded shadow-sm border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left p-3">Item</th>
                    <th className="text-left p-3">Category</th>
                    <th className="text-left p-3">Stock</th>
                    <th className="text-left p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.map((item) => (
                    <tr key={item.id} className="border-b">
                      <td className="p-3">{item.name}</td>
                      <td className="p-3">{item.category || "-"}</td>
                      <td className="p-3">
                        <span
                          className={
                            item.stock <= 5 ? "text-red-600 font-medium" : ""
                          }
                        >
                          {item.stock}
                        </span>
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => handleAddStock(item.menu_item_id)}
                          className="text-blue-600 hover:underline text-sm"
                        >
                          Add Stock
                        </button>
                      </td>
                    </tr>
                  ))}
                  {inventory.length === 0 && (
                    <tr>
                      <td colSpan="4" className="p-3 text-gray-500 text-center">
                        No inventory records
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
