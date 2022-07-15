import { Server } from "@hapi/hapi";
const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);

import {
  createEvent,
  getEvents,
  getEvent,
  updateEvent,
  deleteEvent,
  editEventCheck,
  editEventRelease,
  editEventMaintain,
  getVoucher,
} from "../controllers/events.controller";

const eventObject = Joi.object({
  desc: Joi.string()
    .example("Sale off 50%")
    .required()
    .description("The eventname for account"),
  voucher: Joi.object({
    _id: Joi.objectId().required(),
  })
    .required()
    .description("The object ID of Voucher.")
    .label("voucherId"),
  maxQuantity: Joi.number()
    .example(10)
    .required()
    .integer()
    .min(0)
    .description("The maximum quantity of the voucher"),
  endDate: Joi.date()
    .required()
    .example("12/31/2022 23:59:59")
    .description("The end date for the event."),
}).label("Event");

export const eventRoutes = (server: Server) => {
  // [POST] /event
  server.route({
    method: "POST",
    path: "/event",
    // handler: createEvent,
    options: {
      handler: createEvent,
      description: "Add a new event",
      notes: "Event object that needs to be added to the database",
      tags: ["api", "event"],
      validate: {
        payload: eventObject,
      },
    },
  });

  // [GET] /event/all
  server.route({
    method: "GET",
    path: "/event/all",
    // handler: getEvents,
    options: {
      handler: getEvents,
      description: "Get all events",
      notes: "Returns a list of all events",
      tags: ["api", "event"],
    },
  });

  // [GET] /event/:id
  server.route({
    method: "GET",
    path: "/event/{id}",
    // handler: getEvent,
    options: {
      handler: getEvent,
      description: "Get event by Id",
      notes: "Returns an event by the id passed in the path",
      tags: ["api", "event"],
      validate: {
        params: Joi.object({
          id: Joi.string()
            .required()
            .description("The id for the get event item"),
        }),
      },
    },
  });

  // [PUT] /event/:id
  server.route({
    method: "PUT",
    path: "/event/{id}",
    // handler: updateEvent,
    options: {
      handler: updateEvent,
      description: "Update a new event with form data",
      notes: "Event object that needs to be updated to the database",
      tags: ["api", "event"],
      validate: {
        params: Joi.object({
          id: Joi.string()
            .example("62c2a8fd2900583affbe8358")
            .required()
            .description("The id of event need to be updated"),
        }),
        payload: eventObject,
      },
    },
  });

  // [DELETE] /event/:id
  server.route({
    method: "DELETE",
    path: "/event/{id}",
    // handler: deleteEvent,
    options: {
      handler: deleteEvent,
      description: "Delete event by Id",
      notes: "Delete event from the database",
      tags: ["api", "event"],
      validate: {
        params: Joi.object({
          id: Joi.string().required().description("The id for delete event"),
        }),
      },
    },
  });

  // [POST] /event/:id/editable/me
  server.route({
    method: "POST",
    path: "/event/{id}/editable/me",
    // handler: editEventCheck,
    options: {
      handler: editEventCheck,
      description: "Check event",
      notes: "Check and display event if editable",
      tags: ["api", "event"],
      validate: {
        params: Joi.object({
          id: Joi.string().required().description("The id of event to check"),
        }),
      },
    },
  });

  // [POST] /event/:id/editable/release
  server.route({
    method: "POST",
    path: "/event/{id}/editable/release",
    // handler: editEventRelease,
    options: {
      handler: editEventRelease,
      description: "Update a release event",
      notes: "Event object that needs to be updated to the database",
      tags: ["api", "event"],
      validate: {
        params: Joi.object({
          id: Joi.string()
            .example("62c2a8fd2900583affbe8358")
            .required()
            .description("The id of event need to be updated"),
        }),
        payload: eventObject,
      },
    },
  });

  // [POST] /event/:id/editable/maintain
  server.route({
    method: "GET",
    path: "/event/{id}/editable/maintain",
    options: {
      handler: editEventMaintain,
      description: "Maintain event",
      notes: "Make current event to uneditable for 5 minutes",
      tags: ["api", "event"],
      validate: {
        params: Joi.object({
          id: Joi.string()
            .required()
            .description("The id of event to maintain"),
        }),
        // payload: eventObject,
      },
    },
  });

  // [GET] /event/:id/getVoucher
  server.route({
    method: "POST",
    path: "/event/{id}/getVoucher",
    options: {
      handler: getVoucher,
      description: "Get voucher",
      notes: "Save transaction and voucher, send voucher to mail",
      tags: ["api", "event"],
      validate: {
        params: Joi.object({
          id: Joi.string()
            .required()
            .example("62cb2ced41d417930bf0d084")
            .description("The id for the get event item"),
        }),
        payload: Joi.object({
          receiver: Joi.string()
            .example("ducloc")
            .required()
            .description("The username of receiver"),
          eventDesc: Joi.string()
            .example("Sale off 50%")
            .required()
            .description("The event description"),
          voucherCode: Joi.string()
            .example("SALETO50")
            .required()
            .description("The voucher code."),
        }).label("Get Voucher Object"),
      },
    },
  });
};
