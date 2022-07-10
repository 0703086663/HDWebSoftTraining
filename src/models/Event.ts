import { Schema, model, Document } from "mongoose";
import { Types } from "mongoose";

export interface IEvent extends Document {
  desc: string;
  voucher: Types.ObjectId;
  endDate: Date;
}

const eventSchema = new Schema(
  {
    desc: {
      type: String,
      required: true,
    },
    voucher: {
      type: Types.ObjectId,
      // required: true,
      ref: "voucher",
    },
    endDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export default model<IEvent>("Event", eventSchema);
