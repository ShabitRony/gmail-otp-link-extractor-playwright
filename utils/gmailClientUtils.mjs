// utils/gmailUtils.js
import dotenv from "dotenv";
import { JSDOM } from "jsdom";
import fs from "fs";
import path from "path";
import { google } from "googleapis";

dotenv.config();

const TOKEN_PATH = path.join(process.cwd(), "token.json");

// Setup OAuth2 client
const oAuth2Client = new google.auth.OAuth2(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET,
  process.env.GMAIL_REDIRECT_URI // e.g. http://localhost:3000/oauth2callback
);

// Ensure we have a valid token (auto refresh if expired)
async function authorize() {
  if (fs.existsSync(TOKEN_PATH)) {
    const token = JSON.parse(fs.readFileSync(TOKEN_PATH));
    oAuth2Client.setCredentials(token);

    // Refresh automatically if needed
    oAuth2Client.on("tokens", (tokens) => {
      if (tokens.refresh_token) {
        fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
      }
    });

    return oAuth2Client;
  }

  // First time: log URL to authorize
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/gmail.readonly"],
  });

  console.log("Authorize this app by visiting this url:", authUrl);
  console.log("After approval, run saveToken(code) to store credentials.");
  throw new Error("No token found. Authorize the app first.");
}

// Save token after user gives consent
export async function saveToken(code) {
  const { tokens } = await oAuth2Client.getToken(code);
  oAuth2Client.setCredentials(tokens);
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
  console.log("Token stored to", TOKEN_PATH);
  return oAuth2Client;
}

/**
 * Fetch the latest Gmail email's subject, body text, and first link (from <a> tag).
 * @returns {Promise<{subject: string, body: string, link: string | null}>}
 */
export async function getLatestEmailDetails() {
  const auth = await authorize();
  const gmail = google.gmail({ version: "v1", auth });

  // 1. Get list of messages
  const res1 = await gmail.users.messages.list({
    userId: "me",
    maxResults: 1,
  });

  if (!res1.data.messages || res1.data.messages.length === 0) {
    throw new Error("No emails found");
  }

  // 2. Fetch latest email details
  const latestEmailId = res1.data.messages[0].id;
  const res2 = await gmail.users.messages.get({
    userId: "me",
    id: latestEmailId,
  });

  const emailData = res2.data;

  // Extract Subject
  const subjectHeader = emailData.payload.headers.find(
    (header) => header.name.toLowerCase() === "subject"
  );
  const subject = subjectHeader?.value || "";

  // Extract Body (HTML if available, else text/plain)
  let body = "";
  let htmlBody = "";

  function decodeBase64(data) {
    return Buffer.from(data.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf-8");
  }

  if (emailData.payload.parts) {
    for (const part of emailData.payload.parts) {
      if (part.mimeType === "text/html" && part.body?.data) {
        htmlBody = decodeBase64(part.body.data);
      }
      if (part.mimeType === "text/plain" && part.body?.data) {
        body = decodeBase64(part.body.data);
      }
    }
  }

  if (!body) body = emailData.snippet || "";

  // Extract link from HTML <a>
  let link = null;
  if (htmlBody) {
    const dom = new JSDOM(htmlBody);
    const anchor = dom.window.document.querySelector("a");
    link = anchor ? anchor.href : null;
  }

  // Fallback: plain text link regex
  if (!link) {
    const linkMatch = body.match(/https?:\/\/[^\s]+/);
    link = linkMatch ? linkMatch[0] : null;
  }

  return { subject, body, link };
}
