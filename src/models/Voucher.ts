import { Schema, model, Document, Types } from "mongoose";

export interface IVoucher extends Document {
  name: string;
  code: string;
  eventId: string;
  receiverId: string;
  expiredAt: Date;
}

const voucherSchema = new Schema({
  name: { type: String },
  code: {
    type: String,
    required: true,
    uppercase: true,
  },
  eventId: {
    type: Types.ObjectId,
  },
  receiverId: {
    type: Types.ObjectId,
  },
  receivedAt: {
    type: Date,
    default: Date.now,
  },
  expiredAt: {
    type: Date,
    required: true,
  },
});

export default model<IVoucher>("Voucher", voucherSchema);
