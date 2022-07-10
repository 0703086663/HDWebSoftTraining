import { Server } from "@hapi/hapi";
const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);

import {
  createEvent,
  getEvents,
  getEvent,
  updateEvent,
  deleteEvent,
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

  server.route({
    method: "GET",
    path: "/event/{id}/",
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
};
