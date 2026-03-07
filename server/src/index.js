import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import menuItemRoutes from "./routes/menuItemRoutes.js";
import outletRoutes from "./routes/outletRoutes.js";

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

// basic error handler
app.use((err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).json({ error: err.message || "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
