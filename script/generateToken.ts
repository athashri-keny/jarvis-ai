// scripts/getGoogleToken.ts
import dotenv from "dotenv";
dotenv.config(); // MUST be first, before anything reads process.env

import { google } from "googleapis";

const oAuthClient = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// // generating url for the access token
// const authUrl = oAuthClient.generateAuthUrl({
//   access_type: "offline", // fixed
//   scope: ["https://www.googleapis.com/auth/gmail.readonly"],
//   prompt: "consent",

// });

// console.log(authUrl);


const token = '4/0AXlqoi4pK2JqQNfq07B5D1Lef_QeVJVuXIgqAQ8UxU7Ssv9JfmcYDVYv9k1EdmeKXIXRNw'

const {tokens} = await oAuthClient.getToken(token)


console.log(tokens)
