import { useEffect, useState } from "react";
import api from "../lib/api";
import { formatPrice } from "../lib/config";

export default function MenuItems() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "",
    base_price: "",
  });
  const [editingId, setEditingId] = useState(null);

  const fetchItems = async () => {
    try {
      const res = await api.get("/menu-items");
      setItems(res.data);
    } catch (err) {
      // TODO: show error toast
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/menu-items/${editingId}`, form);
        setEditingId(null);
      } else {
        await api.post("/menu-items", form);
      }
      setForm({ name: "", description: "", category: "", base_price: "" });
      fetchItems();
    } catch (err) {
      alert(
        err.response?.data?.errors?.[0]?.msg ||
          err.response?.data?.error ||
          "Something went wrong",
      );
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setForm({
      name: item.name,
      description: item.description || "",
      category: item.category || "",
      base_price: item.base_price,
    });
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this item?")) return;
    try {
      await api.delete(`/menu-items/${id}`);
      fetchItems();
    } catch (err) {
      alert("Failed to delete");
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setForm({ name: "", description: "", category: "", base_price: "" });
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Master Menu</h2>

      <form
        onSubmit={handleSubmit}
        className="mb-6 p-4 bg-white rounded shadow-sm border"
      >
        <h3 className="font-medium mb-3">
          {editingId ? "Edit Item" : "Add New Item"}
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="Name *"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="border rounded px-3 py-2 text-sm"
            required
          />
          <input
            type="text"
            placeholder="Category"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="border rounded px-3 py-2 text-sm"
          />
          <input
            type="text"
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="border rounded px-3 py-2 text-sm"
          />
          <input
            type="number"
            placeholder="Base Price *"
            value={form.base_price}
            onChange={(e) => setForm({ ...form, base_price: e.target.value })}
            className="border rounded px-3 py-2 text-sm"
            step="0.01"
            required
          />
        </div>
        <div className="mt-3 flex gap-2">
          <button
            type="submit"
            className="bg-gray-900 text-white px-4 py-2 rounded text-sm"
          >
            {editingId ? "Update" : "Add Item"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={handleCancel}
              className="border px-4 py-2 rounded text-sm"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="bg-white rounded shadow-sm border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="text-left p-3">Name</th>
              <th className="text-left p-3">Category</th>
              <th className="text-left p-3">Base Price</th>
              <th className="text-left p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b">
                <td className="p-3">{item.name}</td>
                <td className="p-3">{item.category || "-"}</td>
                <td className="p-3">{formatPrice(item.base_price)}</td>
                <td className="p-3 flex gap-2">
                  <button
                    onClick={() => handleEdit(item)}
                    className="text-blue-600 hover:underline text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-red-600 hover:underline text-sm"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan="4" className="p-3 text-gray-500 text-center">
                  No menu items yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
