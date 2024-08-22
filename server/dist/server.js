"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/server.ts
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const crypto_1 = __importDefault(require("crypto"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 8000;
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
// Replace with your actual keys
const authKey = 'YOUR_AUTH_KEY';
const authIV = 'YOUR_AUTH_IV';
const clientCode = 'YOUR_CLIENT_CODE';
const transUserName = 'YOUR_USERNAME';
const transUserPassword = 'YOUR_PASSWORD';
// Encryption function
function encrypt(data) {
    const cipher = crypto_1.default.createCipheriv('aes-128-cbc', Buffer.from(authKey), Buffer.from(authIV));
    let encrypted = cipher.update(data, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    return encrypted;
}
// Decryption function
function decrypt(encData) {
    const decipher = crypto_1.default.createDecipheriv('aes-128-cbc', Buffer.from(authKey), Buffer.from(authIV));
    let decrypted = decipher.update(encData, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}
// Payment initiation route
app.post('/create-payment-session', (req, res) => {
    const { firstName, lastName, email, phone, amount } = req.body;
    const clientTxnId = crypto_1.default.randomBytes(16).toString('hex');
    const str = `payerName=${firstName.trim()} ${lastName.trim()}&payerEmail=${email.trim()}&payerMobile=${phone.trim()}&clientTxnId=${clientTxnId.trim()}&amount=${amount}&clientCode=${clientCode.trim()}&transUserName=${transUserName.trim()}&transUserPassword=${transUserPassword.trim()}&callbackUrl=http://yourdomain.com/api/payment-webhook&channelId=W&transDate=${new Date().toISOString()}`;
    const encData = encrypt(str);
    const paymentSessionUrl = 'https://securepay.sabpaisa.in/SabPaisa/sabPaisaInit?v=1';
    res.json({
        url: paymentSessionUrl,
        encData: encData,
        clientCode: clientCode,
    });
});
// Webhook to handle payment response
app.post('/api/payment-webhook', (req, res) => {
    const { encResponse } = req.body;
    const decryptedResponse = decrypt(encResponse);
    const responseParams = decryptedResponse.split('&').reduce((acc, param) => {
        const [key, value] = param.split('=');
        acc[key] = value;
        return acc;
    }, {});
    if (responseParams.status === '0000') {
        console.log('Payment Success:', responseParams);
    }
    else {
        console.log('Payment Failed or Other Status:', responseParams);
    }
    res.status(200).send('Webhook received');
});
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
//# sourceMappingURL=server.js.map