import * as outletRepo from "../repositories/outletRepository.js";

export const getAllOutlets = async () => {
  return outletRepo.findAll();
};

export const getOutletById = async (id) => {
  const outlet = await outletRepo.findById(id);
  if (!outlet) {
    throw { status: 404, message: "Outlet not found" };
  }
  return outlet;
};

export const createOutlet = async (data) => {
  return outletRepo.create(data);
};

export const updateOutlet = async (id, data) => {
  const outlet = await outletRepo.update(id, data);
  if (!outlet) {
    throw { status: 404, message: "Outlet not found" };
  }
  return outlet;
};

export const deleteOutlet = async (id) => {
  const outlet = await outletRepo.remove(id);
  if (!outlet) {
    throw { status: 404, message: "Outlet not found" };
  }
  return outlet;
};
