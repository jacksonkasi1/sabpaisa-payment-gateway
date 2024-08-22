// src/server.ts
import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import crypto from "crypto";
import cors from "cors";
import { env } from "./env";

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
  const stringForRequest = `payerName=${firstName.trim()} ${lastName.trim()}&payerEmail=${email.trim()}&payerMobile=${phone.trim()}&clientTxnId=${clientTxnId.trim()}&amount=${amount}&clientCode=${clientCode.trim()}&transUserName=${transUserName.trim()}&transUserPassword=${transUserPassword.trim()}&callbackUrl=https://afa8-103-43-65-80.ngrok-free.app/api/payment-webhook&channelId=W&transDate=${new Date().toISOString()}`;

  // Encrypt the string
  const encData = encrypt(stringForRequest);

  // Set the payment session URL
  const paymentSessionUrl =
    // "https://securepay.sabpaisa.in/SabPaisa/sabPaisaInit?v=1";
    "https://stage-securepay.sabpaisa.in/SabPaisa/sabPaisaInit?v=1";

  // Send the encrypted data and other required parameters to the frontend
  res.json({
    url: paymentSessionUrl,
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

  if (responseParams.status === "0000") {
    console.log("Payment Success:", responseParams);
  } else {
    console.log("Payment Failed or Other Status:", responseParams);
  }

  // res.status(200).send("Webhook received");

  // redirect to frontend

  const frontend_link = "http://localhost:3000/";

  res.redirect(frontend_link);

});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
