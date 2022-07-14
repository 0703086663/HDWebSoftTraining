const { MongoClient } = require("mongodb");

export async function createTransaction(
  email: string,
  eventDesc: string,
  voucherCode: string,
  transactionDates: Date
) {
  const uri =
    "mongodb+srv://admin:admin@hdtrainingcluster.x2gfxia.mongodb.net/?retryWrites=true&w=majority";
  const client = new MongoClient(uri);
  await client.connect();

  const usersCollection = client.db("test").collection("users");
  const eventsCollection = client.db("test").collection("events");

  const transaction = createTransactionDocument(
    eventDesc,
    voucherCode,
    transactionDates
  );

  const session = client.startSession();

  const transactionOptions = {
    readPreference: "primary",
    readConcern: { level: "local" },
    writeConcern: { w: "majority" },
  };

  try {
    const transactionResults = await session.withTransaction(async () => {
      const usersUpdateResults = await usersCollection.updateOne(
        { email: email },
        { $addToSet: { voucherReceived: transaction } },
        { session }
      );
      console.log(
        `${usersUpdateResults.matchedCount} document(s) found in the users collection with the name address ${email}.`
      );
      console.log(
        `${usersUpdateResults.modifiedCount} document(s) was/were updated to include the transaction.`
      );

      const isListingReservedResults = await eventsCollection.findOne(
        { desc: eventDesc, datesReceived: transactionDates },
        { session }
      );
      if (isListingReservedResults) {
        await session.abortTransaction();
        console.error(
          "This listing is already reserved for at least one of the given dates. The transaction could not be created."
        );
        console.error(
          "Any operations that already occurred as part of this transaction will be rolled back."
        );
        return;
      }

      const eventsUpdateResult = await eventsCollection.updateOne(
        { desc: eventDesc },
        {
          $addToSet: {
            receiverInfo: { email: email, receivedAt: transactionDates },
          },
        },
        { session }
      );
      console.log(
        `${eventsUpdateResult.matchedCount} document(s) found in the events collection with the id ${voucherCode}.`
      );
      console.log(
        `${eventsUpdateResult.modifiedCount} document(s) was/were updated to include the transaction dates.`
      );
    }, transactionOptions);

    if (transactionResults) {
      console.log("The transaction was successfully created.");
    } else {
      console.log("The transaction was intentionally aborted.");
    }
  } catch (e) {
    console.log("The transaction was aborted due to an unexpected error: " + e);
  } finally {
    await session.endSession();
  }
}

function createTransactionDocument(
  eventDesc: string,
  voucherCode: string,
  transactionDates: Date
) {
  let transaction: any = {
    eventName: eventDesc,
    voucherCode: voucherCode,
    receivedAt: transactionDates,
  };

  return transaction;
}
