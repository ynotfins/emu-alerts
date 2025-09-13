import { onRequest } from "firebase-functions/v2/https";
import { setGlobalOptions } from "firebase-functions/v2";

// Set default region for all functions
setGlobalOptions({ region: "us-central1" });

// Placeholder ping function for testing
export const ping = onRequest((_req, res) => {
  res.status(200).send("pong");
});