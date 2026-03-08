import * as outletMenuService from "../services/outletMenuService.js";

export const getMenu = async (req, res, next) => {
  try {
    const menu = await outletMenuService.getOutletMenu(req.params.outletId);
    res.json(menu);
  } catch (err) {
    next(err);
  }
};

export const assign = async (req, res, next) => {
  try {
    const result = await outletMenuService.assignMenuItem({
      outlet_id: req.params.outletId,
      menu_item_id: req.body.menu_item_id,
      override_price: req.body.override_price,
    });
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

export const unassign = async (req, res, next) => {
  try {
    const result = await outletMenuService.unassignMenuItem(
      req.params.outletId,
      req.params.menuItemId,
    );
    res.json({ message: "Menu item unassigned", result });
  } catch (err) {
    next(err);
  }
};

export const updatePrice = async (req, res, next) => {
  try {
    const result = await outletMenuService.updateOverridePrice(
      req.params.outletId,
      req.params.menuItemId,
      req.body.override_price,
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
};
