import dotenv from "dotenv";
import { JSDOM } from "jsdom";
import Imap from "imap";
import { simpleParser } from "mailparser";
// import fetch from "node-fetch"; // if you use fetch in Node
dotenv.config();

/**
 * Extract 6-digit OTP from text
 */
function extractOtp(text) {
  if (!text) return null;
  const match = text.match(/\b\d{6}\b/);
  return match ? match[0] : null;
}

/**
 * Gmail API token implementation
 */
async function fetchEmailUsingApi(request) {
  const baseURL = process.env.Gmail_URL;
  const token = process.env.GMAIL_API_TOKEN;

  const res1 = await request.get(`${baseURL}`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res1.json();
  if (!data.messages || data.messages.length === 0) {
    throw new Error("No emails found");
  }

  const latestEmailId = data.messages[0].id;
  const res2 = await request.get(`${baseURL}${latestEmailId}`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const emailData = await res2.json();

  //  Extract Subject
  const subjectHeader = emailData.payload.headers.find(
    (header) => header.name.toLowerCase() === "subject"
  );
  const subject = subjectHeader?.value || "";

    //  Extract Body (HTML if available, else text/plain)
  let body = "";
  let htmlBody = "";

  function decodeBase64(data) {
    return Buffer.from(data.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf-8");
  }

  if (emailData.payload.parts) {
    for (const part of emailData.payload.parts) {
      if (part.mimeType === "text/html" && part.body?.data) htmlBody = decodeBase64(part.body.data);
      if (part.mimeType === "text/plain" && part.body?.data) body = decodeBase64(part.body.data);
    }
  }

  if (!body) body = emailData.snippet || "";

    //  Extract link from HTML <a>
  let link = null;
  if (htmlBody) {
    const dom = new JSDOM(htmlBody);
    const anchor = dom.window.document.querySelector("a");
    link = anchor ? anchor.href : null;
    var buttonName = anchor.textContent.trim();
  }

  // fallback regex
  if (!link) {
    const linkMatch = body.match(/https?:\/\/[^\s]+/);
    link = linkMatch ? linkMatch[0] : null;
  }
  if (!link){ 
    throw new Error("Confirmation link not found in email");
  }
  const otp = extractOtp(body || htmlBody);
  console.log("📧 Email Subject:", subject);
  console.log("🔘 Button Name:", buttonName);
  console.log("🔗 Confirmation Link:", link);
  return { subject, body, link, otp,buttonName };
}

/**
 * Gmail App Password implementation (IMAP)
 */
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

    function openInbox(cb) {
      imap.openBox("INBOX", true, cb);
    }

    imap.once("ready", () => {
      openInbox((err, box) => {
        if (err) return reject(err);

        const fetch = imap.seq.fetch(box.messages.total + ":*", { bodies: "", markSeen: false });

        fetch.on("message", (msg) => {
          msg.on("body", (stream) => {
            simpleParser(stream, async (err, parsed) => {
              if (err) return reject(err);

              const subject = parsed.subject || "";
              const body = parsed.text || "";
              const htmlBody = parsed.html || "";

              let link = null;
              let buttonName = null;
              if (htmlBody) {
                const dom = new JSDOM(htmlBody);
                const anchor = dom.window.document.querySelector("a");
                link = anchor ? anchor.href : null;
                buttonName = anchor ? anchor.textContent.trim() : null;
              }

              if (!link) {
                const linkMatch = body.match(/https?:\/\/[^\s]+/);
                link = linkMatch ? linkMatch[0] : null;
              }

              if (!link){
                throw new Error("Confirmation link not found in email");
              } 

              const otp = extractOtp(body || htmlBody);
              resolve({ subject, body, link, buttonName, otp });
              // console.log("📧 Email Subject:", subject);
              // console.log("🔘 Button Name:", buttonName);
              // console.log("🔗 Confirmation Link:", link);
              console.log("Fetched OTP:", otp);
              imap.end();
            });
          });
        });

        fetch.once("error", (err) => reject(err));
      });
    });

    imap.once("error", (err) => reject(err));
    imap.connect();
  });
}

/**
 * Unified function
 * @param {Object} options
 * @param {"API"|"APP_PASSWORD"} options.method
 * @param {import('@playwright/test').APIRequestContext} [options.request] Required for API method
 */
export async function getLatestEmailDetailsUnified({ method = "APP_PASSWORD", request }) {
  if (method === "API") {
    console.log("Using API method to fetch email");
    
    if (!request) throw new Error("APIRequestContext is required for API method");
    return fetchEmailUsingApi(request);
  } else if (method === "APP_PASSWORD") {
    console.log("Using App Password method to fetch email");
    
    return fetchEmailUsingAppPassword();
  } else {
    throw new Error(`Unknown method: ${method}`);
}
}
