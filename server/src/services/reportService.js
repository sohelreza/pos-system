import * as reportRepo from "../repositories/reportRepository.js";

export const getOutletRevenue = async (outletId) => {
  const revenue = await reportRepo.getRevenueByOutlet(outletId);
  if (!revenue) {
    throw { status: 404, message: "Outlet not found" };
  }
  return revenue;
};

export const getAllRevenue = async () => {
  return reportRepo.getAllOutletsRevenue();
};

export const getTopItems = async (outletId) => {
  return reportRepo.getTopSellingItems(outletId, 5);
};
