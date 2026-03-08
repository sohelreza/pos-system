import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import MenuItems from "./pages/MenuItems";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="menu-items" element={<MenuItems />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
