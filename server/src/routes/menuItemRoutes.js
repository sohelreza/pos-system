import { Router } from "express";
import * as menuItemController from "../controllers/menuItemController.js";

const router = Router();

router.get("/", menuItemController.getAll);
router.get("/:id", menuItemController.getById);
router.post("/", menuItemController.create);
router.put("/:id", menuItemController.update);
router.delete("/:id", menuItemController.remove);

export default router;
