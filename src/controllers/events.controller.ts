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
    const updatedEvent = await Event.findByIdAndUpdate(
      request.params.id,
      (request.payload as object) || {},
      { new: true }
    );
    if (updatedEvent) {
      return h.response(updatedEvent);
    }
    return h.response().code(404);
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
    // const promise = function timeoutPromise(ms: any, promise: any) {
    //   return new Promise((resolve, reject) => {
    //     const timeoutId = setTimeout(() => {
    //       reject(new Error("promise timeout"));
    //     }, ms);
    //     promise.then(
    //       (res: any) => {
    //         clearTimeout(timeoutId);
    //         console.log("thanhcong");
    //         resolve(res);
    //         // setTimeout(() => resolve(res), ms);
    //       },
    //       (err: any) => {
    //         clearTimeout(timeoutId);
    //         console.log("thatbai");
    //         reject(err);
    //       }
    //     );
    //   });
    // };

    const event = await Event.findByIdAndUpdate(request.params.id, {
      // $set: (request.payload as object) || {},
      editable: false,
    });
    if (event) {
      setTimeout(function () {
        Event.findByIdAndUpdate(
          request.params.id,
          {
            $set: { editable: true },
          },
          (err, result) => {
            if (err) {
              console.log(err);
            }
            console.log("back");
          }
        );
      }, 5 * 60 * 1000);
      return h.response(event);
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
  try {
    const body = <getVoucherObject>request.payload;
    const event = await Event.findOne({ desc: body.eventDesc });
    const receiver = await User.findOne({ email: body.receiver });
    const voucher = await Voucher.findOne({ code: body.voucherCode });
    if (!event || !receiver || !voucher) {
      return h
        .response({ status: "Event or User or Voucher is not exist" })
        .code(404);
    } else if (event.maxQuantity <= 0) {
      return h.response({ status: "Out of voucher in this event" }).code(406);
    } else {
      await sendVoucherMail(receiver.email, event._id, voucher._id);
      await createTransaction(
        body.receiver,
        body.eventDesc,
        body.voucherCode,
        new Date(Date.now())
      );
      return h
        .response({ status: "Transaction and send mail have completed" })
        .code(200);
    }
  } catch (err) {
    return h.response(err).code(500);
  }
};
