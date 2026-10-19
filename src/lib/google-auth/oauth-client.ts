
import { google } from "googleapis";

export const oAuthClient = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

oAuthClient.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});