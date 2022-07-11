// import mongoose from "mongoose";
// import { Agenda } from "agenda";

// const mongoConnectionString =
//   "mongodb+srv://admin:admin@hdtrainingcluster.x2gfxia.mongodb.net/?retryWrites=true&w=majority";

// const agenda = new Agenda({ db: { address: mongoConnectionString } });

// agenda.define("mongodbConnectCheck", async () => {
//   await mongoose
//     .connect(mongoConnectionString, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     })
//     .then((db) => console.log("MongoDB is connected."))
//     .catch((err) => console.log("Can not connect to MongoDB"));
// });

// (async function () {
//   await agenda.start();

//   await agenda.every("every minute", "mongodbConnectCheck");
// })();

import mongoose from "mongoose";

mongoose
  .connect(
    "mongodb+srv://admin:admin@hdtrainingcluster.x2gfxia.mongodb.net/?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then((db) => console.log("Db is connected"))
  .catch((err) => console.log(err));
