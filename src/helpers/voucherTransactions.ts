import { MongoError } from "mongodb";
import { ClientSession } from "mongoose";

export async function runTransactionWithRetry(
  txnFunc: any,
  session: ClientSession
) {
  while (true) {
    try {
      txnFunc(session);
    } catch (error) {
      console.log("Transaction aborted. Caught exception during transaction.");
      if (error instanceof Error) {
        console.log(error.message);
      } else if (
        error instanceof MongoError &&
        error.hasErrorLabel("TransientTransactionError")
      ) {
        console.log("TransientTransactionError, retrying transaction ...");
      } else {
        console.log("Error during commit ...");
        throw error;
      }
    }
  }
}

export async function commitWithRetry(session: ClientSession) {
  try {
    await session.commitTransaction();
    console.log("Transaction committed.");
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message);
    } else if (
      error instanceof MongoError &&
      error.hasErrorLabel("UnknownTransactionCommitResult")
    ) {
      console.log(
        "UnknownTransactionCommitResult, retrying commit operation ..."
      );
    } else {
      console.log("Error during commit ...");
      throw error;
    }
  }
}
