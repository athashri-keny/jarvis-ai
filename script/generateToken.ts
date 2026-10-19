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


 const token ="4/0AXlqoi7lGuEETJ9FmLU2t6b_1-mvg2I454OXBI_WQ_4P22mn07ant9LXgOQyhmTgKWiC3Q"

const {tokens} = await oAuthClient.getToken(token)


console.log(tokens)
