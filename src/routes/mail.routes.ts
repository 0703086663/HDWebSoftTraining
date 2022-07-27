import { Server } from "@hapi/hapi";
import Event from "../models/Event";
import { sendVoucherMail, emailObject } from "../queues/email.queue";

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
      const body = <emailObject>req.payload;
      const event = await Event.findById(body.eventId);
      if (!event) {
        return res.response({ status: "Event is not exist" });
      } else {
        if (event.maxQuantity <= 0)
          return res.response({ status: "Out of voucher in this event" });
      }
      await sendVoucherMail(body.receiver, body.voucherId);
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
