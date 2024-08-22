import 'dotenv/config'

export const env = {
  authKey: process.env.AUTH_KEY as string,
  authIV: process.env.AUTH_IV as string,
  clientCode: process.env.CLIENT_CODE as string,
  transUserName: process.env.TRANS_USER_NAME as string,
  transUserPassword: process.env.TRANS_USER_PASSWORD as string,
};
