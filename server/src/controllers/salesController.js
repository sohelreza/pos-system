import * as salesService from "../services/salesService.js";

export const create = async (req, res, next) => {
  try {
    const sale = await salesService.createSale(
      req.params.outletId,
      req.body.items,
    );
    res.status(201).json(sale);
  } catch (err) {
    next(err);
  }
};

export const getByOutlet = async (req, res, next) => {
  try {
    const sales = await salesService.getSalesByOutlet(req.params.outletId);
    res.json(sales);
  } catch (err) {
    next(err);
  }
};

export const getById = async (req, res, next) => {
  try {
    const sale = await salesService.getSaleById(req.params.id);
    res.json(sale);
  } catch (err) {
    next(err);
  }
};
