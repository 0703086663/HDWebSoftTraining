import { Request, ResponseToolkit } from "@hapi/hapi";

import User from "../models/User";
import Event from "../models/Event";
import Editable, { IEditable } from "../models/Editable";

export const editableMe = async (request: Request, h: ResponseToolkit) => {
  try {
    const eventId = request.params.id;
    const body = <IEditable>request.payload;
    const event = await Event.findOne({ _id: eventId });
    if (!event) {
      return h.response({ message: "Can not find event." }).code(404);
    }

    const editable = await Editable.findOne({ eventId: eventId });
    if (!editable) {
      const newEditable = new Editable();
      newEditable.eventId = eventId;
      newEditable.userId = body.userId;
      newEditable.editable = false;
      newEditable.expiredTime = new Date();
      await newEditable.save();

      return h
        .response({
          message: "Allowed Edit",
          newEditable,
        })
        .code(200);
    } else if (editable && editable.editable == true) {
      const editableUpdated = await Editable.findOneAndUpdate(
        { eventId: eventId },
        { editable: false, userId: body.userId },
        { new: true }
      );
      return h
        .response({
          message: "You are allowed to edit",
          editableUpdated,
        })
        .code(200);
    } else if (editable && editable.editable == false) {
      const userEdit = await User.findOne({ _id: body.userId });
      if (userEdit) {
        return h
          .response(userEdit.email + " is editing this event. NOT ALLOWED edit")
          .code(409);
      }
      return h.response("Event is being edited. NOT ALLOWED edit").code(409);
    }
  } catch (err) {
    return h.response(err).code(500);
  }
};

export const editableRelease = async (request: Request, h: ResponseToolkit) => {
  try {
    const eventId = request.params.id;
    const findEditable = await Editable.findOne({ eventId: eventId });
    if (!findEditable) {
      return h.response("Can not find editable event").code(404);
    } else if (findEditable.editable == true) {
      return h.response("Event already released").code(400);
    }
    const releaseEvent = await Editable.findOneAndUpdate(
      { eventId: eventId },
      { userId: null, editable: true, expiredTime: new Date() },
      { new: true }
    );
    return h
      .response({ message: "Event Release Successful", releaseEvent })
      .code(200);
  } catch (err) {
    return h.response(err).code(500);
  }
};

export const editableMaintain = async (
  request: Request,
  h: ResponseToolkit
) => {
  try {
    const eventId = request.params.id;

    const findEditable = await Editable.findOneAndUpdate(
      { eventId: eventId },
      { expiredTime: new Date() },
      { new: true }
    );
    if (findEditable) {
      return h.response({
        message: "Editable time reseted successfully",
        findEditable,
      });
    }
    return h.response({ message: "Editable not found" }).code(404);
  } catch (err) {
    return h.response(err).code(500);
  }
};
