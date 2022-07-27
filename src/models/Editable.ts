import { Schema, model, Document, Types } from "mongoose";

export interface IEditable extends Document {
  eventId: String;
  userId: String;
  editable: Boolean;
  expiredTime: Date;
}

const editableSchema = new Schema({
  eventId: {
    type: Types.ObjectId,
    required: true,
    unique: true,
  },
  userId: {
    type: Types.ObjectId,
    required: true,
  },
  editable: {
    type: Boolean,
    required: true,
  },
  expiredTime: {
    type: Date,
    default: Date.now,
    expires: 300,
  },
});

export default model<IEditable>("Editable", editableSchema);
