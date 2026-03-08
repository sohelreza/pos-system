import { Router } from "express";
import * as inventoryController from "../controllers/inventoryController.js";

const router = Router();

// get all inventory for an outlet
router.get("/:outletId/inventory", inventoryController.getInventory);

// get stock for specific item at outlet
router.get("/:outletId/inventory/:menuItemId", inventoryController.getStock);

// set stock for an item at outlet
router.post("/:outletId/inventory", inventoryController.setStock);

// add stock to existing inventory
router.patch("/:outletId/inventory/:menuItemId", inventoryController.addStock);

export default router;
