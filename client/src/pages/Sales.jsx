import { useEffect, useState } from "react";
import api from "../lib/api";
import { formatPrice } from "../lib/config";

export default function Sales() {
  const [outlets, setOutlets] = useState([]);
  const [selectedOutlet, setSelectedOutlet] = useState("");
  const [outletMenu, setOutletMenu] = useState([]);
  const [cart, setCart] = useState([]);
  const [sales, setSales] = useState([]);
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
    if (!selectedOutlet) {
      setOutletMenu([]);
      setCart([]);
      setSales([]);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const [menuRes, salesRes] = await Promise.all([
          api.get(`/outlets/${selectedOutlet}/menu`),
          api.get(`/outlets/${selectedOutlet}/sales`),
        ]);
        setOutletMenu(menuRes.data);
        setSales(salesRes.data);
      } catch (err) {
        console.log("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedOutlet]);

  const addToCart = (item) => {
    const existing = cart.find((c) => c.menu_item_id === item.menu_item_id);
    if (existing) {
      setCart(
        cart.map((c) =>
          c.menu_item_id === item.menu_item_id
            ? { ...c, quantity: c.quantity + 1 }
            : c,
        ),
      );
    } else {
      setCart([
        ...cart,
        {
          menu_item_id: item.menu_item_id,
          name: item.name,
          price: parseFloat(item.effective_price),
          quantity: 1,
        },
      ]);
    }
  };

  const updateQuantity = (menuItemId, qty) => {
    if (qty <= 0) {
      setCart(cart.filter((c) => c.menu_item_id !== menuItemId));
    } else {
      setCart(
        cart.map((c) =>
          c.menu_item_id === menuItemId ? { ...c, quantity: qty } : c,
        ),
      );
    }
  };

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const handleSubmitSale = async () => {
    if (cart.length === 0) return;
    try {
      const res = await api.post(`/outlets/${selectedOutlet}/sales`, {
        items: cart.map((c) => ({
          menu_item_id: c.menu_item_id,
          quantity: c.quantity,
        })),
      });
      alert(`Sale created! Receipt: ${res.data.receipt_number}`);
      setCart([]);
      // refresh sales list
      const salesRes = await api.get(`/outlets/${selectedOutlet}/sales`);
      setSales(salesRes.data);
    } catch (err) {
      alert(err.response?.data?.error || "Failed to create sale");
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Sales</h2>

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

      {selectedOutlet && !loading && (
        <div className="grid grid-cols-3 gap-4">
          {/* Menu items */}
          <div className="col-span-2">
            <h3 className="font-medium mb-3">Menu</h3>
            <div className="grid grid-cols-3 gap-2">
              {outletMenu.map((item) => (
                <button
                  key={item.menu_item_id}
                  onClick={() => addToCart(item)}
                  className="p-3 bg-white border rounded shadow-sm text-left hover:bg-gray-50 text-sm"
                >
                  <div className="font-medium">{item.name}</div>
                  <div className="text-gray-500">
                    {formatPrice(item.effective_price)}
                  </div>
                </button>
              ))}
              {outletMenu.length === 0 && (
                <p className="text-gray-500 text-sm col-span-3">
                  No menu items assigned to this outlet
                </p>
              )}
            </div>
          </div>

          {/* Cart */}
          <div>
            <h3 className="font-medium mb-3">Current Order</h3>
            <div className="bg-white border rounded shadow-sm p-4">
              {cart.length === 0 ? (
                <p className="text-gray-500 text-sm">No items added</p>
              ) : (
                <>
                  {cart.map((item) => (
                    <div
                      key={item.menu_item_id}
                      className="flex justify-between items-center mb-2 text-sm"
                    >
                      <div className="flex-1">{item.name}</div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            updateQuantity(item.menu_item_id, item.quantity - 1)
                          }
                          className="w-6 h-6 border rounded text-center"
                        >
                          -
                        </button>
                        <span className="w-6 text-center">{item.quantity}</span>
                        <button
                          onClick={() =>
                            updateQuantity(item.menu_item_id, item.quantity + 1)
                          }
                          className="w-6 h-6 border rounded text-center"
                        >
                          +
                        </button>
                        <span className="w-16 text-right">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  ))}
                  <hr className="my-3" />
                  <div className="flex justify-between font-medium text-sm">
                    <span>Total</span>
                    <span>{formatPrice(cartTotal)}</span>
                  </div>
                  <button
                    onClick={handleSubmitSale}
                    className="w-full mt-3 bg-gray-900 text-white py-2 rounded text-sm"
                  >
                    Complete Sale
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Recent sales */}
      {selectedOutlet && sales.length > 0 && (
        <div className="mt-6">
          <h3 className="font-medium mb-3">Recent Sales</h3>
          <div className="bg-white rounded shadow-sm border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left p-3">Receipt</th>
                  <th className="text-left p-3">Total</th>
                  <th className="text-left p-3">Items</th>
                  <th className="text-left p-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((sale) => (
                  <tr key={sale.id} className="border-b">
                    <td className="p-3 font-mono">{sale.receipt_number}</td>
                    <td className="p-3">{formatPrice(sale.total_amount)}</td>
                    <td className="p-3">{sale.items.length} items</td>
                    <td className="p-3">
                      {new Date(sale.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
