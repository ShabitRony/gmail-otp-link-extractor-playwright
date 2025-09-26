import Imap from "imap";
import { simpleParser } from "mailparser"; // npm install mailparser
import dotenv from "dotenv";
import { JSDOM } from "jsdom"; // npm install jsdom
dotenv.config();

 // Extract 6-digit OTP from text
    function extractOtp(text) {
      if (!text) return null;
      const match = text.match(/\b\d{6}\b/);
      return match ? match[0] : null;
    }


/**
 * Connect to Gmail using IMAP and fetch latest email details
 * @returns {Promise<{subject: string, body: string, link: string | null}>}
 */
export async function getLatestEmailDetails() {
  return new Promise((resolve, reject) => {
    const imap = new Imap({
      user: process.env.GMAIL_EMAIL, // full Gmail address
      password: process.env.GMAIL_APP_PASSWORD, // app password (not normal password)
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

        // fetch last email
        const fetch = imap.seq.fetch(box.messages.total + ":*", {
          bodies: "",
          markSeen: false,
        });

        fetch.on("message", (msg) => {
          msg.on("body", (stream) => {
            simpleParser(stream, async (err, parsed) => {
              if (err) return reject(err);

              const subject = parsed.subject || "";
              const body = parsed.text || "";
              const htmlBody = parsed.html || "";

              // extract link from HTML
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
              // extract OTP
              const otp = extractOtp(body || htmlBody);

              resolve({ subject, body, link, buttonName, otp: extractOtp(body)});
              console.log("📧 Email Subject:", subject);
              console.log("🔘 Button Name:", buttonName);
              console.log("🔗 Confirmation Link:", link);
              // console.log(" Extracted OTP:", otp);
              
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
