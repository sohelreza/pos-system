import { Router } from "express";
import * as reportController from "../controllers/reportController.js";

const router = Router();

// all outlets revenue summary
router.get("/revenue", reportController.getAllRevenue);

// single outlet revenue
router.get("/revenue/:outletId", reportController.getOutletRevenue);

// top 5 selling items per outlet
router.get("/top-items/:outletId", reportController.getTopItems);

export default router;
