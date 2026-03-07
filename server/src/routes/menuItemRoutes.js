import { Router } from "express";
import * as menuItemController from "../controllers/menuItemController.js";
import { validateMenuItem } from "../middleware/validators.js";

const router = Router();

router.get("/", menuItemController.getAll);
router.get("/:id", menuItemController.getById);
router.post("/", validateMenuItem, menuItemController.create);
router.put("/:id", validateMenuItem, menuItemController.update);
router.delete("/:id", menuItemController.remove);

export default router;
