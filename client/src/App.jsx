import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import MenuItems from "./pages/MenuItems";
import OutletMenu from "./pages/OutletMenu";
import Outlets from "./pages/Outlets";
import Reports from "./pages/Reports";
import Sales from "./pages/Sales";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="menu-items" element={<MenuItems />} />
          <Route path="outlets" element={<Outlets />} />
          <Route path="outlet-menu" element={<OutletMenu />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="sales" element={<Sales />} />
          <Route path="reports" element={<Reports />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
