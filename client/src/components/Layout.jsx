import { NavLink, Outlet } from "react-router-dom";

const navItems = [
  { to: "/", label: "Dashboard" },
  { to: "/menu-items", label: "Menu Items" },
  { to: "/outlets", label: "Outlets" },
  { to: "/inventory", label: "Inventory" },
  { to: "/sales", label: "Sales" },
  { to: "/reports", label: "Reports" },
];

export default function Layout() {
  return (
    <div className="flex h-screen">
      <aside className="w-56 bg-gray-900 text-white p-4">
        <h1 className="text-lg font-bold mb-6">POS System</h1>
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `px-3 py-2 rounded text-sm ${isActive ? "bg-gray-700 font-medium" : "hover:bg-gray-800"}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-6 overflow-auto bg-gray-50">
        <Outlet />
      </main>
    </div>
  );
}
