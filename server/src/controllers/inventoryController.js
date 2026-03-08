import * as inventoryService from "../services/inventoryService.js";

export const getInventory = async (req, res, next) => {
  try {
    const inventory = await inventoryService.getOutletInventory(
      req.params.outletId,
    );
    res.json(inventory);
  } catch (err) {
    next(err);
  }
};

export const getStock = async (req, res, next) => {
  try {
    const stock = await inventoryService.getItemStock(
      req.params.outletId,
      req.params.menuItemId,
    );
    res.json(stock);
  } catch (err) {
    next(err);
  }
};

export const setStock = async (req, res, next) => {
  try {
    const result = await inventoryService.setItemStock({
      outlet_id: req.params.outletId,
      menu_item_id: req.body.menu_item_id,
      stock: req.body.stock,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const addStock = async (req, res, next) => {
  try {
    const result = await inventoryService.addItemStock(
      req.params.outletId,
      req.params.menuItemId,
      req.body.quantity,
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
};
