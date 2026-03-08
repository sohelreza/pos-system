import * as salesRepo from "../repositories/salesRepository.js";

export const createSale = async (outletId, items) => {
  if (!items || items.length === 0) {
    throw { status: 400, message: "Sale must have at least one item" };
  }

  // basic validation
  for (const item of items) {
    if (!item.menu_item_id || !item.quantity || item.quantity <= 0) {
      throw {
        status: 400,
        message: "Each item must have a valid menu_item_id and quantity",
      };
    }
  }

  return salesRepo.createSale(outletId, items);
};

export const getSalesByOutlet = async (outletId) => {
  return salesRepo.findByOutlet(outletId);
};

export const getSaleById = async (id) => {
  const sale = await salesRepo.findById(id);
  if (!sale) {
    throw { status: 404, message: "Sale not found" };
  }
  return sale;
};
