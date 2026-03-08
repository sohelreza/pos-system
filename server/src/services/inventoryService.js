import * as inventoryRepo from "../repositories/inventoryRepository.js";

export const getOutletInventory = async (outletId) => {
  return inventoryRepo.findByOutlet(outletId);
};

export const getItemStock = async (outletId, menuItemId) => {
  const stock = await inventoryRepo.getStock(outletId, menuItemId);
  if (!stock) {
    throw { status: 404, message: "Inventory record not found" };
  }
  return stock;
};

export const setItemStock = async (data) => {
  if (data.stock < 0) {
    throw { status: 400, message: "Stock cannot be negative" };
  }
  return inventoryRepo.setStock(data);
};

export const addItemStock = async (outletId, menuItemId, quantity) => {
  const record = await inventoryRepo.addStock(outletId, menuItemId, quantity);
  if (!record) {
    throw {
      status: 404,
      message: "Inventory record not found. Set initial stock first.",
    };
  }
  return record;
};
