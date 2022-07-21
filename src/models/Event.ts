import { Schema, model, Document } from "mongoose";
import { Types } from "mongoose";

export interface IEvent extends Document {
  desc: string;
  voucher: Types.ObjectId;
  maxQuantity: number;
  enable: boolean;
  endDate: Date;
  editable: boolean;
  editingBy: string;
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
    maxQuantity: {
      type: Number,
      required: true,
      default: 0,
    },
    enable: {
      type: Boolean,
    },
    endDate: {
      type: Date,
    },
    editable: {
      type: Boolean,
      default: true,
    },
    editingBy: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

eventSchema.pre<IEvent>("save", function (next) {
  const event = this;

  if (event.maxQuantity > 0) {
    event.enable = true;
    return next();
  }
  event.enable = false;
  next();
});

export default model<IEvent>("Event", eventSchema);
