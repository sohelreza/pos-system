import { Router } from "express";
import * as outletController from "../controllers/outletController.js";

const router = Router();

router.get("/", outletController.getAll);
router.get("/:id", outletController.getById);
router.post("/", outletController.create);
router.put("/:id", outletController.update);
router.delete("/:id", outletController.remove);

export default router;
