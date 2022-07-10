import { Schema, model, Document } from "mongoose";

export interface IVoucher extends Document {
  code: string;
  desc: string;
  discount: number;
  constraint: string;
  quantity: number;
  enable: boolean;
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
    quantity: {
      type: Number,
      required: true,
      default: 0,
    },
    enable: {
      type: Boolean,
    },
    constraint: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

voucherSchema.pre<IVoucher>("save", function (next) {
  const voucher = this;

  if (voucher.quantity > 0) {
    voucher.enable = true;
    return next();
  }
  voucher.enable = false;
  next();
});

export default model<IVoucher>("Voucher", voucherSchema);
