import { Server } from "@hapi/hapi";
// import * as Joi from "joi";
const Joi = require("joi");

import {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
} from "../controllers/users.controller";

const userObject = Joi.object({
  username: Joi.string()
    .example("johnsmith123")
    .required()
    .description("The username for account"),
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .example("thanhntgcs190601@fpt.edu.vn")
    .required()
    .description("The email of user"),
  password: Joi.string()
    .example(123456)
    .required()
    .min(6)
    .description("The password for account"),
}).label("User");

export const routes = (server: Server) => {
  server.route({
    method: "POST",
    path: "/user",
    options: {
      handler: createUser,
      description: "Add a new user",
      notes: "User object that needs to be added to the database",
      tags: ["api", "user"],
      validate: {
        payload: userObject,
      },
    },
  });

  server.route({
    method: "GET",
    path: "/user/all",
    options: {
      handler: getUsers,
      description: "Get all users",
      notes: "Returns a list of all users",
      tags: ["api", "user"],
    },
  });

  server.route({
    method: "GET",
    path: "/user/{id}/",
    options: {
      handler: getUser,
      description: "Get user by Id",
      notes: "Returns an user by the id passed in the path",
      tags: ["api", "user"],
      validate: {
        params: Joi.object({
          id: Joi.string()
            .required()
            .description("The id for the get user item"),
        }),
      },
    },
  });

  server.route({
    method: "PUT",
    path: "/user/{id}",
    options: {
      handler: updateUser,
      description: "Update a new user with form data",
      notes: "User object that needs to be updated to the database",
      tags: ["api", "user"],
      validate: {
        params: Joi.object({
          id: Joi.string()
            .example("62c2a8fd2900583affbe8358")
            .required()
            .description("The id of user need to be updated"),
        }),
        payload: userObject,
      },
    },
  });

  server.route({
    method: "DELETE",
    path: "/user/{id}",
    options: {
      handler: deleteUser,
      description: "Delete user by Id",
      notes: "Delete user from the database",
      tags: ["api", "user"],
      validate: {
        params: Joi.object({
          id: Joi.string().required().description("The id for delete user"),
        }),
      },
    },
  });
};
