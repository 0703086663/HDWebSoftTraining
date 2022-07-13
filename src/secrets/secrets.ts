import * as dotenv from "dotenv";

dotenv.config();

export const EMAIL: string | undefined =
  process.env.EMAIL_USERNAME || "nguyentienthanh.tgdd@gmail.com";
export const PASSWORD: string | undefined =
  process.env.EMAIL_APP_PASSWORD || "fdpcycsrdcumuaar";
