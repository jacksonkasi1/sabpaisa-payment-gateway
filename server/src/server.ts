// src/server.ts
import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import crypto from "crypto";
import cors from "cors";
import { env } from "./env";
import { config } from "./config";

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors()); // Enable CORS for all routes
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Extract env variables
const { authIV, authKey, clientCode, transUserName, transUserPassword } = env;

// Encryption function
function encrypt(data: string): string {
  const cipher = crypto.createCipheriv(
    "aes-128-cbc",
    Buffer.from(authKey),
    Buffer.from(authIV)
  );
  let encrypted = cipher.update(data, "utf8", "base64");
  encrypted += cipher.final("base64");
  return encrypted;
}

// Decryption function
function decrypt(encData: string): string {
  const decipher = crypto.createDecipheriv(
    "aes-128-cbc",
    Buffer.from(authKey),
    Buffer.from(authIV)
  );
  let decrypted = decipher.update(encData, "base64", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "server running...",
  });
});

// Payment initiation route
app.post("/api/create-payment-session", (req: Request, res: Response) => {
  const { firstName, lastName, email, phone, amount } = req.body;

  // Generate a unique transaction ID
  const clientTxnId = crypto.randomBytes(16).toString("hex");

  // Create the string for encryption
  const stringForRequest = [
    `payerName=${firstName.trim()} ${lastName.trim()}`,
    `payerEmail=${email.trim()}`,
    `payerMobile=${phone.trim()}`,
    `clientTxnId=${clientTxnId.trim()}`,
    `amount=${amount}`,
    `clientCode=${clientCode.trim()}`,
    `transUserName=${transUserName.trim()}`,
    `transUserPassword=${transUserPassword.trim()}`,
    `callbackUrl=${config.callbackUrl}`,
    `channelId=W`,
    `transDate=${new Date().toISOString()}`
  ].join('&');

  // Encrypt the string
  const encData = encrypt(stringForRequest);

  // Send the encrypted data and other required parameters to the frontend
  res.json({
    url: config.stagingUrl,
    encData: encData,
    clientCode: clientCode,
  });
});

// Webhook to handle payment response
app.post("/api/payment-webhook", (req: Request, res: Response) => {
  const { encResponse } = req.body;

  // Decrypt the response
  const decryptedResponse = decrypt(encResponse);
  const responseParams = decryptedResponse
    .split("&")
    .reduce((acc: { [key: string]: string }, param: string) => {
      const [key, value] = param.split("=");
      acc[key] = value;
      return acc;
    }, {});

  // Check for payment success
  const isPaymentSuccess = responseParams.status === "SUCCESS" && responseParams.statusCode === "0000";

  if (isPaymentSuccess) {
    console.log("Payment Success:", responseParams);
  } else {
    console.log("Payment Failed or Other Status:", responseParams);
  }

  // Redirect to frontend
  res.redirect(config.frontendUrl);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
