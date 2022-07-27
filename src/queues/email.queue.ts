import Queue from "bull";
import nodemailer from "nodemailer";
import { EMAIL, PASSWORD } from "../secrets/secrets";
import Voucher from "../models/Voucher";
export interface emailObject {
  receiver: string;
  eventId: string;
  voucherId: string;
}

// QUEUE FOR EMAIL
export const emailQueue = new Queue("email", {
  redis: { port: 6379, host: "127.0.0.1" },
});
emailQueue.on("global:completed", function (job, result) {
  console.log(job.id + "has completed");
});
emailQueue.on("global:failed", function (job, error) {
  console.log(job.id + "has failed");
});
emailQueue.process(async (job, done) => {
  try {
    await job.progress(42);
    sendVoucherMail(job.data.receiver, job.data.voucherId);
  } catch (err) {
    console.log(err);
  } finally {
    done();
  }
});

//SENDING EMAIL
const sendVoucherMail = async (
  receiver: string,
  // eventId: string,
  voucherId: string
) => {
  // const event = await Event.findByIdAndUpdate(eventId, {
  //   $inc: { maxQuantity: -1 },
  // });
  const voucher = await Voucher.findById(voucherId);

  if (voucher) {
    emailQueue.add(
      { receiver, voucherId },
      {
        attempts: 5,
      }
    );
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: EMAIL,
        pass: PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const mailOptions = {
      from: EMAIL,
      to: receiver,
      subject: `Receive voucher from event`,
      html: `You have received a voucher from ${voucher.name}<br>
           CODE: <b>${voucher.code}</b><br>
           EXPIRED AT: <b>${voucher.expiredAt}</b>`,
    };

    await transporter.sendMail(mailOptions, function (err, info) {
      if (err) console.log(err);
      console.log("Send success to: " + info.accepted);
    });
  } else {
    console.log("No voucher found. Send mail error");
  }
};

export { sendVoucherMail };
