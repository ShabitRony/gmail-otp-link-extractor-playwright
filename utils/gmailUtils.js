// import dotenv from "dotenv";
// import { JSDOM } from "jsdom";
// import Imap from "imap";
// import { simpleParser } from "mailparser";
// // import fetch from "node-fetch"; // if you use fetch in Node
// dotenv.config();

// /**
//  * Extract 6-digit OTP from text
//  */
// function extractOtp(text) {
//   if (!text) return null;
//   const match = text.match(/\b\d{6}\b/);
//   return match ? match[0] : null;
// }

// /**
//  * Gmail API token implementation
//  */
// async function fetchEmailUsingApi(request) {
//   const baseURL = process.env.Gmail_URL;
//   const token = process.env.GMAIL_API_TOKEN;

//   const res1 = await request.get(`${baseURL}`, {
//     headers: {
//       Accept: "application/json",
//       Authorization: `Bearer ${token}`,
//     },
//   });

//   const data = await res1.json();
//   if (!data.messages || data.messages.length === 0) {
//     throw new Error("No emails found");
//   }

//   const latestEmailId = data.messages[0].id;
//   const res2 = await request.get(`${baseURL}${latestEmailId}`, {
//     headers: {
//       Accept: "application/json",
//       Authorization: `Bearer ${token}`,
//     },
//   });

//   const emailData = await res2.json();

//   //  Extract Subject
//   const subjectHeader = emailData.payload.headers.find(
//     (header) => header.name.toLowerCase() === "subject"
//   );
//   const subject = subjectHeader?.value || "";

//     //  Extract Body (HTML if available, else text/plain)
//   let body = "";
//   let htmlBody = "";

//   function decodeBase64(data) {
//     return Buffer.from(data.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf-8");
//   }

//   if (emailData.payload.parts) {
//     for (const part of emailData.payload.parts) {
//       if (part.mimeType === "text/html" && part.body?.data) htmlBody = decodeBase64(part.body.data);
//       if (part.mimeType === "text/plain" && part.body?.data) body = decodeBase64(part.body.data);
//     }
//   }

//   if (!body) body = emailData.snippet || "";

//     //  Extract link from HTML <a>
//   let link = null;
//   if (htmlBody) {
//     const dom = new JSDOM(htmlBody);
//     const anchor = dom.window.document.querySelector("a");
//     link = anchor ? anchor.href : null;
//     var buttonName = anchor.textContent.trim();
//   }

//   // fallback regex
//   if (!link) {
//     const linkMatch = body.match(/https?:\/\/[^\s]+/);
//     link = linkMatch ? linkMatch[0] : null;
//   }
//   if (!link){ 
//     throw new Error("Confirmation link not found in email");
//   }
//   const otp = extractOtp(body || htmlBody);
//   console.log("📧 Email Subject:", subject);
//   console.log("🔘 Button Name:", buttonName);
//   console.log("🔗 Confirmation Link:", link);
//   return { subject, body, link, otp,buttonName };
// }

// /**
//  * Gmail App Password implementation (IMAP)
//  */
// async function fetchEmailUsingAppPassword() {
//   return new Promise((resolve, reject) => {
//     const imap = new Imap({
//       user: process.env.GMAIL_EMAIL,
//       password: process.env.GMAIL_APP_PASSWORD,
//       host: "imap.gmail.com",
//       port: 993,
//       tls: true,
//       tlsOptions: { rejectUnauthorized: false },
//     });

//     function openInbox(cb) {
//       imap.openBox("INBOX", true, cb);
//     }

//     imap.once("ready", () => {
//       openInbox((err, box) => {
//         if (err) return reject(err);

//         const fetch = imap.seq.fetch(box.messages.total + ":*", { bodies: "", markSeen: false });

//         fetch.on("message", (msg) => {
//           msg.on("body", (stream) => {
//             simpleParser(stream, async (err, parsed) => {
//               if (err) return reject(err);

//               const subject = parsed.subject || "";
//               const body = parsed.text || "";
//               const htmlBody = parsed.html || "";

//               let link = null;
//               let buttonName = null;
//               if (htmlBody) {
//                 const dom = new JSDOM(htmlBody);
//                 const anchor = dom.window.document.querySelector("a");
//                 link = anchor ? anchor.href : null;
//                 buttonName = anchor ? anchor.textContent.trim() : null;
//               }

//               if (!link) {
//                 const linkMatch = body.match(/https?:\/\/[^\s]+/);
//                 link = linkMatch ? linkMatch[0] : null;
//               }

//               if (!link){
//                 throw new Error("Confirmation link not found in email");
//               } 

//               const otp = extractOtp(body || htmlBody);
//               resolve({ subject, body, link, buttonName, otp });
//               // console.log("📧 Email Subject:", subject);
//               // console.log("🔘 Button Name:", buttonName);
//               // console.log("🔗 Confirmation Link:", link);
//               console.log("Fetched OTP:", otp);
//               imap.end();
//             });
//           });
//         });

//         fetch.once("error", (err) => reject(err));
//       });
//     });

//     imap.once("error", (err) => reject(err));
//     imap.connect();
//   });
// }

// /**
//  * Unified function
//  * @param {Object} options
//  * @param {"API"|"APP_PASSWORD"} options.method
//  * @param {import('@playwright/test').APIRequestContext} [options.request] Required for API method
//  */
// export async function getLatestEmailDetailsUnified({ method = "APP_PASSWORD", request }) {
//   if (method === "API") {
//     console.log("Using API method to fetch email");
    
//     if (!request) throw new Error("APIRequestContext is required for API method");
//     return fetchEmailUsingApi(request);
//   } else if (method === "APP_PASSWORD") {
//     console.log("Using App Password method to fetch email");
    
//     return fetchEmailUsingAppPassword();
//   } else {
//     throw new Error(`Unknown method: ${method}`);
// }
// }


// utils/gmailCombineUtils.js (ESM)
import dotenv from "dotenv";
import { JSDOM } from "jsdom";
import Imap from "imap";
import { simpleParser } from "mailparser";
import fs from "fs";
import path from "path";
import { google } from "googleapis";

dotenv.config();

const TOKEN_PATH = path.join(process.cwd(), "token.json");

// ---------- helpers ----------
function extractOtp(text) {
  if (!text) return null;
  const m = text.match(/\b\d{6}\b/);
  return m ? m[0] : null;
}
function decodeBase64WebSafe(data) {
  return Buffer.from(data.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf-8");
}
function firstLinkFromHtml(html) {
  if (!html) return { link: null, buttonName: null };
  const dom = new JSDOM(html);
  const a = dom.window.document.querySelector("a");
  return {
    link: a ? a.href : null,
    buttonName: a ? a.textContent.trim() : null,
  };
}
function firstLinkFromText(text) {
  const m = text?.match(/https?:\/\/[^\s]+/);
  return m ? m[0] : null;
}

// ---------- METHOD 1: API token (Playwright request) ----------
async function fetchEmailUsingApi(request) {
  const baseURL = process.env.Gmail_URL;           // e.g. https://www.googleapis.com/gmail/v1/users/me/messages/
  const token   = process.env.GMAIL_API_TOKEN;

  const res1 = await request.get(`${baseURL}`, {
    headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
  });
  const data = await res1.json();
  if (!data.messages?.length) throw new Error("No emails found");

  const latestId = data.messages[0].id;
  const res2 = await request.get(`${baseURL}${latestId}`, {
    headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
  });
  const emailData = await res2.json();

  const subject = emailData.payload.headers.find(h => h.name.toLowerCase() === "subject")?.value || "";
  let body = "", htmlBody = "";

  if (emailData.payload.parts?.length) {
    for (const part of emailData.payload.parts) {
      if (part.mimeType === "text/html" && part.body?.data) htmlBody = decodeBase64WebSafe(part.body.data);
      if (part.mimeType === "text/plain" && part.body?.data) body = decodeBase64WebSafe(part.body.data);
    }
  } else if (emailData.payload.body?.data) {
    // some emails come as single-part
    body = decodeBase64WebSafe(emailData.payload.body.data);
  }
  if (!body) body = emailData.snippet || "";

  let { link, buttonName } = firstLinkFromHtml(htmlBody);
  if (!link) link = firstLinkFromText(body);
  if (!link) throw new Error("Confirmation link not found in email");

  const otp = extractOtp(body || htmlBody);
  return { subject, body, link, buttonName, otp };
}

// ---------- METHOD 2: App Password (IMAP) ----------
async function fetchEmailUsingAppPassword() {
  return new Promise((resolve, reject) => {
    const imap = new Imap({
      user: process.env.GMAIL_EMAIL,
      password: process.env.GMAIL_APP_PASSWORD,
      host: "imap.gmail.com",
      port: 993,
      tls: true,
      tlsOptions: { rejectUnauthorized: false },
    });

    const openInbox = (cb) => imap.openBox("INBOX", true, cb);

    imap.once("ready", () => {
      openInbox((err, box) => {
        if (err) return reject(err);
        const fetch = imap.seq.fetch(`${box.messages.total}:*`, { bodies: "", markSeen: false });

        fetch.on("message", (msg) => {
          msg.on("body", (stream) => {
            simpleParser(stream, async (err2, parsed) => {
              if (err2) return reject(err2);

              const subject  = parsed.subject || "";
              const body     = parsed.text || "";
              const htmlBody = parsed.html || "";

              let { link, buttonName } = firstLinkFromHtml(htmlBody);
              if (!link) link = firstLinkFromText(body);
              if (!link) return reject(new Error("Confirmation link not found in email"));

              const otp = extractOtp(body || htmlBody);
              resolve({ subject, body, link, buttonName, otp });
              imap.end();
            });
          });
        });

        fetch.once("error", (e) => reject(e));
      });
    });

    imap.once("error", (e) => reject(e));
    imap.connect();
  });
}

// ---------- METHOD 3: OAuth Client (googleapis) ----------
const oAuth2Client = new google.auth.OAuth2(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET,
  process.env.GMAIL_REDIRECT_URI
);

async function authorize() {
  if (fs.existsSync(TOKEN_PATH)) {
    const token = JSON.parse(fs.readFileSync(TOKEN_PATH));
    oAuth2Client.setCredentials(token);
    oAuth2Client.on("tokens", (tokens) => {
      if (tokens.refresh_token) fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
    });
    return oAuth2Client;
  }
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/gmail.readonly"],
  });
  throw new Error(`No token found. Authorize the app first:\n${authUrl}\nThen call saveToken(code).`);
}

export async function saveToken(code) {
  const { tokens } = await oAuth2Client.getToken(code);
  oAuth2Client.setCredentials(tokens);
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
  return oAuth2Client;
}

async function fetchEmailUsingOAuth() {
  const auth = await authorize();
  const gmail = google.gmail({ version: "v1", auth });

  const res1 = await gmail.users.messages.list({ userId: "me", maxResults: 1 });
  if (!res1.data.messages?.length) throw new Error("No emails found");

  const id = res1.data.messages[0].id;
  const res2 = await gmail.users.messages.get({ userId: "me", id });
  const emailData = res2.data;

  const subject = emailData.payload.headers.find(h => h.name.toLowerCase() === "subject")?.value || "";
  let body = "", htmlBody = "";

  if (emailData.payload.parts?.length) {
    for (const part of emailData.payload.parts) {
      if (part.mimeType === "text/html" && part.body?.data) htmlBody = decodeBase64WebSafe(part.body.data);
      if (part.mimeType === "text/plain" && part.body?.data) body = decodeBase64WebSafe(part.body.data);
    }
  } else if (emailData.payload.body?.data) {
    body = decodeBase64WebSafe(emailData.payload.body.data);
  }
  if (!body) body = emailData.snippet || "";

  let { link, buttonName } = firstLinkFromHtml(htmlBody);
  if (!link) link = firstLinkFromText(body);
  if (!link) throw new Error("Confirmation link not found in email");

  const otp = extractOtp(body || htmlBody);
  return { subject, body, link, buttonName, otp };
}

// ---------- Unified entry ----------
/**
 * @param {"APP_PASSWORD"|"API"|"OAUTH"} method
 * @param {import('@playwright/test').APIRequestContext} [request] required for "API"
 * @returns {Promise<{subject:string, body:string, link:string, buttonName:string|null, otp:string|null}>}
 */
export async function getLatestEmailDetailsUnified({ method = "APP_PASSWORD", request } = {}) {
  if (method === "API") {
    if (!request) throw new Error("APIRequestContext is required for API method");
    return fetchEmailUsingApi(request);
  }
  if (method === "OAUTH") {
    return fetchEmailUsingOAuth();
  }
  // default
  return fetchEmailUsingAppPassword();
}
