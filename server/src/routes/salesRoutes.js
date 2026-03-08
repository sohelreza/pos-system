import { Router } from "express";
import * as salesController from "../controllers/salesController.js";

const router = Router();

router.post("/:outletId/sales", salesController.create);
router.get("/:outletId/sales", salesController.getByOutlet);
router.get("/:outletId/sales/:id", salesController.getById);

export default router;
