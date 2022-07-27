import { Request, ResponseToolkit, ResponseObject } from "@hapi/hapi";
import Event from "../models/Event";
import User from "../models/User";
import Voucher from "../models/Voucher";
import { startSession } from "mongoose";

import { commitWithRetry } from "../helpers/voucherTransactions";
import { sendVoucherMail } from "../queues/email.queue";

interface getVoucherObject {
  eventId: string;
  receiver: string;
}

export const createEvent = async (
  request: Request,
  h: ResponseToolkit
): Promise<ResponseObject> => {
  try {
    const event = new Event(request.payload);
    const eventSaved = await event.save();
    return h.response(eventSaved);
  } catch (err) {
    return h.response(err).code(500);
  }
};

export const getEvents = async (
  request: Request,
  h: ResponseToolkit
): Promise<ResponseObject> => {
  try {
    const events = await Event.find();
    return h.response(events);
  } catch (err) {
    return h.response(err).code(500);
  }
};

export const getEvent = async (
  request: Request,
  h: ResponseToolkit
): Promise<ResponseObject> => {
  try {
    const eventfound = await Event.findById(request.params.id);
    if (eventfound) {
      return h.response(eventfound);
    }
    return h.response().code(404);
  } catch (err) {
    return h.response(err).code(500);
  }
};

export const updateEvent = async (
  request: Request,
  h: ResponseToolkit
): Promise<ResponseObject> => {
  try {
    const event = await Event.findByIdAndUpdate(
      request.params.id,
      (request.payload as object) || {},
      { new: true }
    );
    if (event) {
      return h.response(event);
    }
    return h.response().code(404);
  } catch (error) {
    return h.response(error).code(500);
  }
};

export const deleteEvent = async (
  request: Request,
  h: ResponseToolkit
): Promise<ResponseObject> => {
  try {
    const deletedEvent = await Event.findByIdAndDelete(request.params.id);
    if (deletedEvent) {
      return h.response(deletedEvent);
    }
    return h.response().code(404);
  } catch (err) {
    return h.response(err).code(500);
  }
};

export const getVoucher = async (
  request: Request,
  h: ResponseToolkit
): Promise<ResponseObject> => {
  const session = await startSession();
  session.startTransaction({
    readConcern: { level: "snapshot" },
    writeConcern: { w: "majority" },
  });
  try {
    const body = <getVoucherObject>request.payload;
    const event = await Event.findById(body.eventId);
    if (event) {
      const receiver = await User.findOne({ email: body.receiver });

      if (!receiver) {
        return h.response({ message: "User not found!" }).code(404);
      } else {
        var updatedEvent = await Event.findOneAndUpdate(
          { _id: body.eventId, maxQuantity: { $gt: 0 } },
          { $inc: { maxQuantity: -1 } },
          { session: session, new: true }
        );

        if (updatedEvent) {
          const newVoucher = new Voucher(
            {
              name: event.desc,
              code: Math.floor(100000 + Math.random() * 900000),
              eventId: event._id,
              receiverId: receiver._id,
              expiredAt: event.endDate,
            },
            { session: session }
          );
          await newVoucher.save();

          await sendVoucherMail(receiver.email, newVoucher._id);

          await commitWithRetry(session);

          return h.response(newVoucher);
        }
        return h
          .response({
            message: "Voucher is out of stock in this event!",
          })
          .code(406);
      }
    } else {
      return h.response({ message: "Event not found!" }).code(404);
    }
  } catch (err) {
    console.log(err);
    await session.abortTransaction();
    return h.response(err).code(500);
  }
};
