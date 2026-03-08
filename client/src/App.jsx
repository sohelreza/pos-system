import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import MenuItems from "./pages/MenuItems";
import Outlets from "./pages/Outlets";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="menu-items" element={<MenuItems />} />
          <Route path="outlets" element={<Outlets />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
