import {
  Request,
  ResponseToolkit,
  ResponseObject,
  // NextFunction,
} from "@hapi/hapi";
import Event from "../models/Event";
import User from "../models/User";
import Voucher from "../models/Voucher";

import { createTransaction } from "../helpers/transactions";
import { sendVoucherMail } from "../queues/email.queue";
import console from "console";

interface getVoucherObject {
  receiver: string;
  eventDesc: string;
  voucherCode: string;
  // receivedAt: Date;
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
    const event = await Event.findById(request.params.id);
    if (event?.editable === false) {
      return h
        .response({ message: "Events cannot be edited at this time." })
        .code(400);
    }
    await Event.findByIdAndUpdate(
      request.params.id,
      (request.payload as object) || {},
      { new: true }
    );
    return h.response({ message: "Event not found!" }).code(404);
  } catch (err) {
    return h.response(err).code(500);
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

export const editEventCheck = async (
  request: Request,
  h: ResponseToolkit
): Promise<ResponseObject> => {
  try {
    const event = await Event.findOne({ _id: request.params.id }); //Find event by ID
    if (!event) return h.response("Not found").code(404); //Not found event
    else if (event.editable == false)
      return h.response("Not allowed").code(409); //Not allowed for edit
    return h.response("Allowed edit").code(200); //Editable
  } catch (err) {
    return h.response(err).code(500);
  }
};

export const editEventRelease = async (
  request: Request,
  h: ResponseToolkit
): Promise<ResponseObject> => {
  try {
    console.log(request.payload);
    const event = await Event.findById(request.params.id);
    if (event) {
      return h.response(event).code(200);
    }
    return h.response("Not allowed").code(409);
  } catch (err) {
    return h.response(err).code(500);
  }
};

export const editEventMaintain = async (
  request: Request,
  h: ResponseToolkit
): Promise<ResponseObject> => {
  try {
    const event = await Event.findById(request.params.id);
    if (event) {
      var second: number = 5; //(seconds) Time to reset timeout
      const resetTimeout = setInterval(() => {
        second = second - 1;
        // Set false first
        Event.findByIdAndUpdate(
          request.params.id,
          {
            editable: false,
          },
          (err, result) => {
            if (err) {
              console.log(err);
            }
          }
        );
        // Set true after timeout (5mins)
        if (second <= 0) {
          clearInterval(resetTimeout);
          Event.findByIdAndUpdate(
            request.params.id,
            {
              $set: { editable: true },
            },
            (err, result) => {
              if (err) {
                console.log(err);
              }
            }
          );
        }
      }, 1000); // 1 second in interval
      return h.response("Event is being edited");
    }
    return h.response("Event not found").code(404);
  } catch (err) {
    return h.response(err).code(500);
  }
};

export const getVoucher = async (
  request: Request,
  h: ResponseToolkit
): Promise<ResponseObject> => {
  try {
    const body = <getVoucherObject>request.payload;
    const event = await Event.findOne({ desc: body.eventDesc });
    const receiver = await User.findOne({ email: body.receiver });
    const voucher = await Voucher.findOne({ code: body.voucherCode });
    if (!event || !receiver || !voucher) {
      return h
        .response({ message: "Event or User or Voucher is not exist" })
        .code(404);
    } else if (event.maxQuantity <= 0) {
      return h.response({ message: "Out of voucher in this event" }).code(406);
    } else {
      await sendVoucherMail(receiver.email, event._id, voucher._id);
      await createTransaction(
        body.receiver,
        body.eventDesc,
        body.voucherCode,
        new Date(Date.now())
      );
      return h
        .response({ message: "Transaction and send mail have completed" })
        .code(200);
    }
  } catch (err) {
    return h.response(err).code(500);
  }
};
