import { Router } from "express";
import * as outletController from "../controllers/outletController.js";
import { validateOutlet } from "../middleware/validators.js";

const router = Router();

router.get("/", outletController.getAll);
router.get("/:id", outletController.getById);
router.post("/", validateOutlet, outletController.create);
router.put("/:id", validateOutlet, outletController.update);
router.delete("/:id", outletController.remove);

export default router;
