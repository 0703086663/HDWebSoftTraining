const Hapi = require("@hapi/hapi");
const Inert = require("@hapi/inert");
const Vision = require("@hapi/vision");
const HapiSwagger = require("hapi-swagger");

import { routes } from "./routes/user.routes";
import { eventRoutes } from "./routes/event.routes";
import { voucherRoutes } from "./routes/voucher.routes";
import { mailRoutes } from "./routes/mail.routes";

export const init = async () => {
  const server = Hapi.server({
    port: 3000,
    host: "localhost",
  });

  const swaggerOptions = {
    info: {
      title: "Voucher API Documentation",
      version: "1.0.0",
    },
  };

  await server.register([
    Inert,
    Vision,
    {
      plugin: HapiSwagger,
      options: swaggerOptions,
    },
  ]);

  mailRoutes(server);
  routes(server);
  eventRoutes(server);
  voucherRoutes(server);

  try {
    await server.start();
    console.log("Server running at:", server.info.uri);
  } catch (err) {
    console.log(err);
  }
};
