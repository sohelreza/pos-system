import * as reportService from "../services/reportService.js";

export const getOutletRevenue = async (req, res, next) => {
  try {
    const revenue = await reportService.getOutletRevenue(req.params.outletId);
    res.json(revenue);
  } catch (err) {
    next(err);
  }
};

export const getAllRevenue = async (req, res, next) => {
  try {
    const revenue = await reportService.getAllRevenue();
    res.json(revenue);
  } catch (err) {
    next(err);
  }
};

export const getTopItems = async (req, res, next) => {
  try {
    const items = await reportService.getTopItems(req.params.outletId);
    res.json(items);
  } catch (err) {
    next(err);
  }
};
