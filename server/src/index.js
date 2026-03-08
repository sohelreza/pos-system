import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { errorHandler } from "./middleware/errorHandler.js";
import inventoryRoutes from "./routes/inventoryRoutes.js";
import menuItemRoutes from "./routes/menuItemRoutes.js";
import outletMenuRoutes from "./routes/outletMenuRoutes.js";
import outletRoutes from "./routes/outletRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import salesRoutes from "./routes/salesRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/menu-items", menuItemRoutes);
app.use("/api/outlets", outletRoutes);
app.use("/api/outlets", outletMenuRoutes);
app.use("/api/outlets", inventoryRoutes);
app.use("/api/outlets", salesRoutes);
app.use("/api/reports", reportRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
