import { Router } from "express";
import * as outletMenuController from "../controllers/outletMenuController.js";

const router = Router();

// get menu for an outlet
router.get("/:outletId/menu", outletMenuController.getMenu);

// assign menu item to outlet
router.post("/:outletId/menu", outletMenuController.assign);

// unassign menu item from outlet
router.delete("/:outletId/menu/:menuItemId", outletMenuController.unassign);

// update override price
router.patch(
  "/:outletId/menu/:menuItemId/price",
  outletMenuController.updatePrice,
);

export default router;
