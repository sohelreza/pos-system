import { useEffect, useState } from "react";
import api from "../lib/api";

export default function Outlets() {
  const [outlets, setOutlets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", address: "" });
  const [editingId, setEditingId] = useState(null);

  const fetchOutlets = async () => {
    try {
      const res = await api.get("/outlets");
      setOutlets(res.data);
    } catch (err) {
      console.log("Failed to fetch outlets", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOutlets();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/outlets/${editingId}`, form);
        setEditingId(null);
      } else {
        await api.post("/outlets", form);
      }
      setForm({ name: "", address: "" });
      fetchOutlets();
    } catch (err) {
      alert(
        err.response?.data?.errors?.[0]?.msg ||
          err.response?.data?.error ||
          "Something went wrong",
      );
    }
  };

  const handleEdit = (outlet) => {
    setEditingId(outlet.id);
    setForm({ name: outlet.name, address: outlet.address || "" });
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this outlet?")) return;
    try {
      await api.delete(`/outlets/${id}`);
      fetchOutlets();
    } catch (err) {
      alert("Failed to delete");
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setForm({ name: "", address: "" });
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Outlets</h2>

      <form
        onSubmit={handleSubmit}
        className="mb-6 p-4 bg-white rounded shadow-sm border"
      >
        <h3 className="font-medium mb-3">
          {editingId ? "Edit Outlet" : "Add New Outlet"}
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="Outlet Name *"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="border rounded px-3 py-2 text-sm"
            required
          />
          <input
            type="text"
            placeholder="Address"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            className="border rounded px-3 py-2 text-sm"
          />
        </div>
        <div className="mt-3 flex gap-2">
          <button
            type="submit"
            className="bg-gray-900 text-white px-4 py-2 rounded text-sm"
          >
            {editingId ? "Update" : "Add Outlet"}
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
              <th className="text-left p-3">Address</th>
              <th className="text-left p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {outlets.map((outlet) => (
              <tr key={outlet.id} className="border-b">
                <td className="p-3">{outlet.name}</td>
                <td className="p-3">{outlet.address || "-"}</td>
                <td className="p-3 flex gap-2">
                  <button
                    onClick={() => handleEdit(outlet)}
                    className="text-blue-600 hover:underline text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(outlet.id)}
                    className="text-red-600 hover:underline text-sm"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {outlets.length === 0 && (
              <tr>
                <td colSpan="3" className="p-3 text-gray-500 text-center">
                  No outlets yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
