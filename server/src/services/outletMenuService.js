import * as outletMenuRepo from "../repositories/outletMenuRepository.js";

export const getOutletMenu = async (outletId) => {
  return outletMenuRepo.findByOutlet(outletId);
};

export const assignMenuItem = async (data) => {
  return outletMenuRepo.assign(data);
};

export const unassignMenuItem = async (outletId, menuItemId) => {
  const item = await outletMenuRepo.unassign(outletId, menuItemId);
  if (!item) {
    throw { status: 404, message: "Assignment not found" };
  }
  return item;
};

export const updateOverridePrice = async (outletId, menuItemId, price) => {
  const item = await outletMenuRepo.updatePrice(outletId, menuItemId, price);
  if (!item) {
    throw { status: 404, message: "Assignment not found" };
  }
  return item;
};
