import * as outletService from "../services/outletService.js";

export const getAll = async (req, res, next) => {
  try {
    const outlets = await outletService.getAllOutlets();
    res.json(outlets);
  } catch (err) {
    next(err);
  }
};

export const getById = async (req, res, next) => {
  try {
    const outlet = await outletService.getOutletById(req.params.id);
    res.json(outlet);
  } catch (err) {
    next(err);
  }
};

export const create = async (req, res, next) => {
  try {
    const outlet = await outletService.createOutlet(req.body);
    res.status(201).json(outlet);
  } catch (err) {
    next(err);
  }
};

export const update = async (req, res, next) => {
  try {
    const outlet = await outletService.updateOutlet(req.params.id, req.body);
    res.json(outlet);
  } catch (err) {
    next(err);
  }
};

export const remove = async (req, res, next) => {
  try {
    const outlet = await outletService.deleteOutlet(req.params.id);
    res.json({ message: "Outlet deleted", outlet });
  } catch (err) {
    next(err);
  }
};
