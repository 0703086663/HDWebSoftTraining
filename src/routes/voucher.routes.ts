import { Server } from "@hapi/hapi";
// import * as Joi from "joi";
const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);

import {
  createVoucher,
  getVouchers,
  getVoucher,
  updateVoucher,
  deleteVoucher,
} from "../controllers/vouchers.controller";

const voucherObject = Joi.object({
  code: Joi.string()
    .example("SALETO50")
    .required()
    .description("Code of voucher"),
  desc: Joi.string()
    .example("Sale up to 50%")
    .description("Description of the voucher"),
  discount: Joi.number()
    .integer()
    .positive()
    .example(50)
    .required()
    .min(0)
    .max(100)
    .description("The percentage (%) of the voucher"),
  constraint: Joi.string()
    .example("One use only")
    .description("Limit the number of uses or vouchers"),
}).label("Voucher");

export const voucherRoutes = (server: Server) => {
  server.route({
    method: "POST",
    path: "/voucher",
    options: {
      handler: createVoucher,
      description: "Add a new voucher",
      notes: "Voucher object that needs to be added to the database",
      tags: ["api", "voucher"],
      validate: {
        payload: voucherObject,
      },
    },
  });

  server.route({
    method: "GET",
    path: "/voucher/all",
    options: {
      handler: getVouchers,
      description: "Get all vouchers",
      notes: "Returns a list of all vouchers",
      tags: ["api", "voucher"],
    },
  });

  server.route({
    method: "GET",
    path: "/voucher/{id}/",
    options: {
      handler: getVoucher,
      description: "Get voucher by Id",
      notes: "Returns an voucher by the id passed in the path",
      tags: ["api", "voucher"],
      validate: {
        params: Joi.object({
          id: Joi.string()
            .required()
            .description("The id for the get voucher item"),
        }),
      },
    },
  });

  server.route({
    method: "PUT",
    path: "/voucher/{id}",
    options: {
      handler: updateVoucher,
      description: "Update a new voucher with form data",
      notes: "Voucher object that needs to be updated to the database",
      tags: ["api", "voucher"],
      validate: {
        params: Joi.object({
          id: Joi.string()
            .example("62c2a8fd2900583affbe8358")
            .required()
            .description("The id of voucher need to be updated"),
        }),
        payload: voucherObject,
      },
    },
  });

  server.route({
    method: "DELETE",
    path: "/voucher/{id}",
    options: {
      handler: deleteVoucher,
      description: "Delete voucher by Id",
      notes: "Delete voucher from the database",
      tags: ["api", "voucher"],
      validate: {
        params: Joi.object({
          id: Joi.string().required().description("The id for delete voucher"),
        }),
      },
    },
  });
};
