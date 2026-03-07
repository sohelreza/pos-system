import * as menuItemService from "../services/menuItemService.js";

export const getAll = async (req, res, next) => {
  try {
    const items = await menuItemService.getAllMenuItems();
    res.json(items);
  } catch (err) {
    next(err);
  }
};

export const getById = async (req, res, next) => {
  try {
    const item = await menuItemService.getMenuItemById(req.params.id);
    res.json(item);
  } catch (err) {
    next(err);
  }
};

export const create = async (req, res, next) => {
  try {
    const item = await menuItemService.createMenuItem(req.body);
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
};

export const update = async (req, res, next) => {
  try {
    const item = await menuItemService.updateMenuItem(req.params.id, req.body);
    res.json(item);
  } catch (err) {
    next(err);
  }
};

export const remove = async (req, res, next) => {
  try {
    const item = await menuItemService.deleteMenuItem(req.params.id);
    res.json({ message: "Menu item deleted", item });
  } catch (err) {
    next(err);
  }
};
