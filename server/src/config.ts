// src/config.ts
export const config = {
    stagingUrl: process.env.NODE_ENV === 'production'
      ? 'https://securepay.sabpaisa.in/SabPaisa/sabPaisaInit?v=1'
      : 'https://stage-securepay.sabpaisa.in/SabPaisa/sabPaisaInit?v=1',
  
    callbackUrl: 'https://9ec7-103-43-65-80.ngrok-free.app/api/payment-webhook', // Update with your ngrok URL
    frontendUrl: 'http://localhost:3000', // Your frontend URL
  };
