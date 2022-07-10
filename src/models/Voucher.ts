import { Schema, model, Document } from "mongoose";

export interface IVoucher extends Document {
  code: string;
  desc: string;
  discount: number;
  constraint: string;
}

const voucherSchema = new Schema(
  {
    code: {
      type: String,
      required: true,
      uppercase: true,
    },
    desc: {
      type: String,
    },
    discount: {
      type: Number,
      required: true,
      default: 0,
    },
    constraint: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export default model<IVoucher>("Voucher", voucherSchema);
