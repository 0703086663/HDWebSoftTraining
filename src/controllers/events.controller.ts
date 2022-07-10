import { Request, ResponseToolkit, ResponseObject } from "@hapi/hapi";
import Event from "../models/Event";

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
