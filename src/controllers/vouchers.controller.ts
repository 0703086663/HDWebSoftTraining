import { Request, ResponseToolkit, ResponseObject } from "@hapi/hapi";
import Voucher from "../models/Voucher";

export const createVoucher = async (
  request: Request,
  h: ResponseToolkit
): Promise<ResponseObject> => {
  try {
    const voucher = new Voucher(request.payload);
    const voucherSaved = await voucher.save();
    return h.response(voucherSaved);
  } catch (err) {
    return h.response(err).code(500);
  }
};

export const getVouchers = async (
  request: Request,
  h: ResponseToolkit
): Promise<ResponseObject> => {
  try {
    const vouchers = await Voucher.find();
    return h.response(vouchers);
  } catch (err) {
    return h.response(err).code(500);
  }
};

export const getVoucher = async (
  request: Request,
  h: ResponseToolkit
): Promise<ResponseObject> => {
  try {
    const voucherfound = await Voucher.findById(request.params.id);
    if (voucherfound) {
      return h.response(voucherfound);
    }
    return h.response().code(404);
  } catch (err) {
    return h.response(err).code(500);
  }
};

export const updateVoucher = async (
  request: Request,
  h: ResponseToolkit
): Promise<ResponseObject> => {
  try {
    const updatedVoucher = await Voucher.findByIdAndUpdate(
      request.params.id,
      (request.payload as object) || {},
      { new: true }
    );
    if (updatedVoucher) {
      return h.response(updatedVoucher);
    }
    return h.response().code(404);
  } catch (err) {
    return h.response(err).code(500);
  }
};

export const deleteVoucher = async (
  request: Request,
  h: ResponseToolkit
): Promise<ResponseObject> => {
  try {
    const deletedVoucher = await Voucher.findByIdAndDelete(request.params.id);
    if (deletedVoucher) {
      return h.response(deletedVoucher);
    }
    return h.response().code(404);
  } catch (err) {
    return h.response(err).code(500);
  }
};
