import * as menuItemRepo from "../repositories/menuItemRepository.js";

export const getAllMenuItems = async () => {
  return menuItemRepo.findAll();
};

export const getMenuItemById = async (id) => {
  const item = await menuItemRepo.findById(id);
  if (!item) {
    throw { status: 404, message: "Menu item not found" };
  }
  return item;
};

export const createMenuItem = async (data) => {
  return menuItemRepo.create(data);
};

export const updateMenuItem = async (id, data) => {
  const item = await menuItemRepo.update(id, data);
  if (!item) {
    throw { status: 404, message: "Menu item not found" };
  }
  return item;
};

export const deleteMenuItem = async (id) => {
  const item = await menuItemRepo.remove(id);
  if (!item) {
    throw { status: 404, message: "Menu item not found" };
  }
  return item;
};
