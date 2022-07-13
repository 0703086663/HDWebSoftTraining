import Queue from "bull";
import nodemailer from "nodemailer";
import { EMAIL, PASSWORD } from "../secrets/secrets";

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
    sendVoucherMail(job.data);
  } catch (err) {
    console.log(err);
  } finally {
    done();
  }
});

const sendVoucherMail = async (data: string) => {
  emailQueue.add(data, {
    attempts: 5,
  });
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

  const mailOptions = JSON.parse(data);

  await transporter.sendMail(mailOptions, function (err, info) {
    if (err) console.log(err);
    console.log("Send success to: " + info.accepted);
  });
};

export { sendVoucherMail };
