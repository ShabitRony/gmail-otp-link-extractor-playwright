import dotenv from "dotenv";
import { JSDOM } from "jsdom"; // npm install jsdom
dotenv.config();

const baseURL = process.env.Gmail_URL;
const token = process.env.GMAIL_API_TOKEN;

/**
 * Fetch the latest Gmail email's subject, body text, and first link (from <a> tag).
 * @param {import('@playwright/test').APIRequestContext} request - Playwright API request context
 * @returns {Promise<{subject: string, body: string, link: string | null}>}
 */
export async function getLatestEmailDetails(request) {
  // Get list of messages
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

  // 2 Fetch latest email details
  const latestEmailId = data.messages[0].id;
  const res2 = await request.get(
    `${baseURL}${latestEmailId}`,
    {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

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
      if (part.mimeType === "text/html" && part.body?.data) {
        htmlBody = decodeBase64(part.body.data);
      }
      if (part.mimeType === "text/plain" && part.body?.data) {
        body = decodeBase64(part.body.data);
      }
    }
  }

  if (!body) body = emailData.snippet || "";

  //  Extract link from HTML <a>
  let link = null;
  if (htmlBody) {
    const dom = new JSDOM(htmlBody);
    const anchor = dom.window.document.querySelector("a"); // first <a> tag (the button usually is <a>)
    link = anchor ? anchor.href : null;
  }

  // Fallback: plain text link regex
  if (!link) {
    const linkMatch = body.match(/https?:\/\/[^\s]+/);
    link = linkMatch ? linkMatch[0] : null;
  }

  return { subject, body, link };
}
