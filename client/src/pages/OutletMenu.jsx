import { useEffect, useState } from "react";
import api from "../lib/api";
import { formatPrice } from "../lib/config";

export default function OutletMenu() {
  const [outlets, setOutlets] = useState([]);
  const [selectedOutlet, setSelectedOutlet] = useState("");
  const [outletMenu, setOutletMenu] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState("");
  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    const fetchAllItems = async () => {
      try {
        const res = await api.get("/menu-items");
        setAllItems(res.data);
      } catch (err) {
        console.log("Failed to fetch menu items");
      }
    };
    fetchAllItems();
  }, []);

  const fetchOutletMenu = async (outletId) => {
    if (!outletId) return;
    setLoading(true);
    try {
      const res = await api.get(`/outlets/${outletId}/menu`);
      setOutletMenu(res.data);
    } catch (err) {
      console.log("Failed to fetch outlet menu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedOutlet) {
      fetchOutletMenu(selectedOutlet);
    } else {
      setOutletMenu([]);
    }
  }, [selectedOutlet]);

  const handleAssign = async () => {
    if (!selectedOutlet || !selectedItem) return;
    try {
      await api.post(`/outlets/${selectedOutlet}/menu`, {
        menu_item_id: parseInt(selectedItem),
      });
      setSelectedItem("");
      fetchOutletMenu(selectedOutlet);
    } catch (err) {
      alert(err.response?.data?.error || "Failed to assign");
    }
  };

  const handleUnassign = async (menuItemId) => {
    if (!confirm("Remove this item from outlet?")) return;
    try {
      await api.delete(`/outlets/${selectedOutlet}/menu/${menuItemId}`);
      fetchOutletMenu(selectedOutlet);
    } catch (err) {
      alert("Failed to unassign");
    }
  };

  // filter out already assigned items
  const assignedIds = outletMenu.map((m) => m.menu_item_id);
  const availableItems = allItems.filter(
    (item) => !assignedIds.includes(item.id),
  );

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Outlet Menu Assignment</h2>

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
          <div className="mb-6 p-4 bg-white rounded shadow-sm border">
            <h3 className="font-medium mb-3">Assign Menu Item</h3>
            <div className="flex gap-3">
              <select
                value={selectedItem}
                onChange={(e) => setSelectedItem(e.target.value)}
                className="border rounded px-3 py-2 text-sm flex-1"
              >
                <option value="">Select Item</option>
                {availableItems.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} - {formatPrice(item.base_price)}
                  </option>
                ))}
              </select>
              <button
                onClick={handleAssign}
                disabled={!selectedItem}
                className="bg-gray-900 text-white px-4 py-2 rounded text-sm disabled:opacity-50"
              >
                Assign
              </button>
            </div>
          </div>

          {loading ? (
            <p>Loading...</p>
          ) : (
            <div className="bg-white rounded shadow-sm border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left p-3">Item</th>
                    <th className="text-left p-3">Category</th>
                    <th className="text-left p-3">Base Price</th>
                    <th className="text-left p-3">Effective Price</th>
                    <th className="text-left p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {outletMenu.map((item) => (
                    <tr key={item.id} className="border-b">
                      <td className="p-3">{item.name}</td>
                      <td className="p-3">{item.category || "-"}</td>
                      <td className="p-3">{formatPrice(item.base_price)}</td>
                      <td className="p-3">
                        {formatPrice(item.effective_price)}
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => handleUnassign(item.menu_item_id)}
                          className="text-red-600 hover:underline text-sm"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                  {outletMenu.length === 0 && (
                    <tr>
                      <td colSpan="5" className="p-3 text-gray-500 text-center">
                        No items assigned to this outlet
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
