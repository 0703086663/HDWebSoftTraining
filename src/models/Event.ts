import { Schema, model, Document } from "mongoose";

export interface IEvent extends Document {
  desc: string;
  maxQuantity: number;
  receivedQuantity: number;
  endDate: Date;
}

const eventSchema = new Schema(
  {
    desc: {
      type: String,
      required: true,
    },
    maxQuantity: {
      type: Number,
      required: true,
      default: 0,
    },
    receivedQuantity: {
      type: Number,
      default: 0,
    },
    endDate: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default model<IEvent>("Event", eventSchema);
