# HDWebSoftTraining

## Overview
Voucher application is designed for Database transactions learning and Recognizing shared transactions and locked transactions through read preference and write concerns.
To do those actions above, my application have been designed by using: 
- Hapi for initial server
- TypeScript as programming languages
- MongoDB for noSQL database (Mongoose for CRUD functions)
- Agenda to check database connection every minute
- Bull for email queue
- Swagger for API docs 
- Joi for request validations
- Nodemailer for send email

This unit tests document is written to report for the source code and implementation of it to meet the requirements. This document goes into a basic setup from programming languages to server, database and functions to meet requirements.
 
Over at all, to run a NodeJS application you need install it to the application through
``` 
npm init
```

This will generate a package.json file for you. But I also need to configure it to compile TypeScript to JavaScript then run my application.
```typescript
{
  "name": "hapijs-typescript-restapi",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
	"dev": "nodemon -e ts --exec \"npm run buildrun\"",
	"build": "tsc",
	"buildrun": "npm run build && node ./dist/index.js"
  },
...
}
```
 
After config I can easily run with nodemon through Terminal by (recommend dev)
``` 
npm run dev
```

or

```
npm run buildrun
```
  
## TypeScript
TypeScript is a language for application-scale JavaScript. TypeScript adds optional types to JavaScript that support tools for large-scale JavaScript applications for any browser, for any host, on any OS. TypeScript compiles to readable, standards-based JavaScript.
To install TypeScript to your computer using:
```
npm install -g typescript
```

Then i need to configure TypeScript through file tsconfig.json for optional requirements which meet my application’s requirements. Before do that, I need to install tsconfig.json for my application through:
```
tsc --init
```

Or if I don't want to install Typescript globally, I can use npx:

```
npx tsc --init
```

With the tsconfig.json after install you can config it with the examples which are included 
```typescript
{
 "compilerOptions": {
   "target": "es5",
   "module": "commonjs",
   "sourceMap": true,
   "outDir": "./dist",
   "rootDir": "./src",
   "removeComments": true,   
   "strict": true,
   "useUnknownInCatchVariables": false,
   "noImplicitAny": true,
   "noUnusedLocals": true,
   "moduleResolution": "node",
   "baseUrl": "./",
   "paths": {
     "@apimodel": ["plugins/swagger.json"]},
   "esModuleInterop": true,
   "experimentalDecorators": true,
   "emitDecoratorMetadata": true,
   "skipLibCheck": true,
   "forceConsistentCasingInFileNames": true,
   "resolveJsonModule": true
 },
 "exclude": ["node_modules"],
 "include": ["src/**/*.ts"]
}
```

## Hapi
Hapi is designed for creating robust, testable applications. To this end, Hapi includes the ability to test routes without having to actually start a server, completely avoiding the time overheads and added complexity of the TCP protocol.
To install Hapi Server for application use:
```
npm install @hapi/hapi
```

Also, in TypeScript i need to install a compiler from TypeScript to Java for running application.
```
npm install @types/hapi__hapi
```

I made a minor modification to it, such that it doesn't automatically start when referenced from my tests. I call this file app.js and place it in the lib directory of my project:
```typescript
const Hapi = require("@hapi/hapi");
 
import { eventRoutes } from "./routes/event.routes";
 
export const init = async () => {
  const server = Hapi.server({
	port: 3000,
	host: "localhost",
  });
 
  eventRoutes(server);
 
  try {
	await server.start();
	console.log("Server running at:", server.info.uri);
  } catch (err) {
	console.log(err);
  }
};
```
 
Then I can run my application by npm run dev then the server will log to screen
 


## Mongooose
To use database (MongoDB) in the application, I need to import mongoose and mongoose for typescript by using:
``` 
npm install mongoose
```
```
npm install @types/mongoose
```
Therefore, before running mongoose in application, I need to create an mongoDB account on website or by mongoDB Compass then create a database and cluster to store data. After create a database to store data, I choose connect the application then I got a connect string like
> mongodb+srv://admin:<password>@hdtrainingcluster.x2gfxia.mongodb.net/?retryWrites=true&w=majority
After that I replace password and cluster which is designed above then add it to the database.ts
```typescript
import mongoose from "mongoose";
 
mongoose.connect("mongodb+srv://admin:admin@hdtrainingcluster.x2gfxia.mongodb.net/?retryWrites=true&w=majority",
	{
  	useNewUrlParser: true,
  	useUnifiedTopology: true,
	}
  )
  .then((db) => console.log("Db is connected"))
  .catch((err) => console.log(err));
```
Then import it to the index.ts for implement.
```typescript
import { init } from "./app";
import "./database";
init();
```
And log the notification if it connected or error if not

## Swagger
Continue with Hapi server and following the requirements, I use swagger for API docs. To install swagger, I also need to install inert and vision plugs-ins which support templates and static content serving.
```
npm install hapi-swagger
npm install @hapi/vision
npm install @hapi/inert
```
Then install it to application through the app.ts, then after implement the application, I can get into localhost:3000/documentation to read the API docs for the application, but it is needed to install Joi to create modal on Swagger API docs.
```typescript
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
 ```
 
## Agenda
To set up a job that run every minute like check if the database connection is good or not, Agenda is a light-weight job scheduling library for Node.js. Agenda's basic control structure is an instance of an agenda. Agenda's are mapped to a database collection and load the jobs from within.
To install agenda for the application, use:
```
npm install agenda
```
Then for the TypeScript import agenda to the application, use:
```
import { Agenda } from "agenda";
```
After that, use the mongo connect string to define the uri to connect to the database and use agenda to check connection every minute.
```typescript
import mongoose from "mongoose";
import { Agenda } from "agenda";
 
const mongoConnectionString =
  "mongodb+srv://admin:admin@hdtrainingcluster.x2gfxia.mongodb.net/?retryWrites=true&w=majority";
 
const agenda = new Agenda({ db: { address: mongoConnectionString } });
 
agenda.define("mongodbConnectCheck", async () => {
  await mongoose
	.connect(mongoConnectionString, {
  	useNewUrlParser: true,
  	useUnifiedTopology: true,
	})
	.then((db) => console.log("MongoDB is connected."))
	.catch((err) => console.log("Can not connect to MongoDB"));
});
 
(async function () {
  await agenda.start();
 
  await agenda.every("every minute", "mongodbConnectCheck");
})();
```
In the function ``` agenda.every() ```, I can change the every minute to another time schedule defend on the requirement of system.
 
## Bull
To handle the master or worker processing, Bull is popular among large and small organizations.
Bull welcomes all types of contributions, either code fixes, new features or doc improvements. Code formatting is enforced by prettier. For commits please follow conventional commits convention. All code must pass lint rules and test suites before it can be merged into develop.
To install Bull for application with TypeScript use:
```
npm install bull
npm install @types/bull –save-dev
```
So it is a good choice to choose Bull for email queue working, for basic setup to run bull in NodeJS following the docs of Bull, the code are:
```typescript
import Queue from "bull";
 
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
	sendVoucherMail(job.data.receiver, job.data.eventId, job.data.voucherId);
  } catch (err) {
	console.log(err);
  } finally {
	done();
  }
});
```

Because Bull is the framework to support application for create a job queue to handle the processing of each one then run later, so it needs a job during the process of Queue. Depend on requirement, send voucher email is a process that needs a Queue in Bull to process each email then send to customer. In this work, nodemailer needs to be installed to support sending email.

## Nodemailer
Nodemailer is a module for Node.js applications to allow easy as cake email sending. It is the solution most Node.js developers turn to by default. To install nodemailer:
``` 
npm install nodemailer
```
Then import it to the queue file above to create a send mail function which can be added to the queue and processed before sending or canceled if error occurs.
```typescript 
import nodemailer from "nodemailer";
import { EMAIL, PASSWORD } from "../secrets/secrets";
import Event from "../models/Event";
import Voucher from "../models/Voucher";
export interface emailObject {
  receiver: string;
  eventId: string;
  voucherId: string;
}
 
//SENDING EMAIL
const sendVoucherMail = async (
  receiver: string,
  eventId: string,
  voucherId: string
) => {
  const event = await Event.findByIdAndUpdate(eventId, {
	$inc: { maxQuantity: -1 },
  });
  const voucher = await Voucher.findById(voucherId);
 
  emailQueue.add(
	{ receiver, eventId, voucherId },
	{attempts: 5,}
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
	html: `You have received a voucher from ${event?.desc}<br>
       	CODE: <b>${voucher?.code}</b><br>
           EXPIRED AT: <b>${event?.endDate}</b>`,
  };
 
  await transporter.sendMail(mailOptions, function (err, info) {
	if (err) console.log(err);
	console.log("Send success to: " + info.accepted);
  });
};
 
export { sendVoucherMail };
```
 
To use nodemailer, I need to get email and password for the sender from Gmail example. Then Create a Nodemailer transporter using either SMTP or some other transport mechanism and Set up message options (who sends what to whom). After complete work above, Deliver the message object using the sendVoucherMail() method of your previously created transporter and send email or add to Queue to process.
 

