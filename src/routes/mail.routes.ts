import { Server } from "@hapi/hapi";

import { sendVoucherMail } from "../queues/email.queue";

const { createBullBoard } = require("@bull-board/api");
const { BullAdapter } = require("@bull-board/api/bullAdapter");
import { emailQueue } from "../queues/email.queue";
const { ExpressAdapter } = require("@bull-board/express");

const serverAdapter = new ExpressAdapter();
const {} = createBullBoard({
  queues: [new BullAdapter(emailQueue)],
  serverAdapter: serverAdapter,
});
serverAdapter.setBasePath("/admin/queues");

export const mailRoutes = (server: Server) => {
  server.route({
    method: "POST",
    path: "/send-email",
    handler: async (req, res) => {
      await sendVoucherMail(JSON.stringify(req.payload));
      return res.response({ status: "Success" });
    },
  });

  server.route({
    method: "GET",
    path: "/admin/queues",
    handler: async (req, res) => {
      await serverAdapter.getRouter();
      return res.response({ status: "Connected to Bull-Board" });
    },
  });
};
