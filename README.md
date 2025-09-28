## 📌 Playwright Automation – Gmail OTP & Account Confirmation
# This project automates Gmail-based flows using Playwright.
- It covers extracting OTP from Gmail and accessing confirmation links (via Gmail API Token or Gmail App Password).
## 🚀 Features Automated
- Gmail Account Confirmation

- Fetches confirmation email from Gmail.

- Extracts confirmation link from HTML body.

- Clicks Confirm Account button from the email.

- Verifies successful login.

## 🔑 OTP Extraction

- Fetches OTP from Gmail email.

- Extracts OTP from plain text.

- Enters OTP into application OTP field.

## Prerequisites

- Node.js
- installed (v18+ recommended).

- Gmail account with 2-Factor Authentication enabled.(2-Factor authentication optional for Gmail-API-Token)

- A valid OAuth 2.0 token generated from Google OAuth Playground or a Gmail App Password.

## ⚙️ Installation & Setup
- Clone the Repository

`git clone https://github.com/ShabitRony/gmail-otp-link-extractor-playwright`
`cd gmail-otp-link-extractor-playwright`

## Install Dependencies

`npm install`

## Install Playwright Browsers:

`npx playwright install`

##  Gmail Access Setup
# Option 1 — Generate Gmail API token (OAuth 2.0 Playground)

- When to use: preferred for production or when you need OAuth refresh tokens (safer and Google-recommended). 


- Use OAuth 2.0 Playground to get tokens

- Open OAuth 2.0 Playground: https://developers.google.com/oauthplayground

- On the left side of the Playground, under Step 1 — Select & authorize APIs, scroll the list or use the search box and locate Gmail API v1.

- Under Gmail API expand it and check the scope:

`https://www.googleapis.com/auth/gmail.readonly`


- (that scope gives read-only access to mail). 
- Then click Authorize APIs. 

- Playground will display an Access token, Refresh token, and expiry. Copy these values.

- Where to put tokens in .env (example)

- GMAIL_API_TOKEN=<ya29.a0Af...>         # the access token from Playground


Option 2 — Generate Gmail App Password (simpler, for scripts that use SMTP/IMAP clients which don’t support OAuth)

- When to use: quick for personal accounts or development when the app accepts username+password (but not preferable for production). App passwords require 2-Step Verification on the Google account. 

Step-by-step (desktop / web browser):

- Open https://myaccount.google.com
- and sign in to the Google account you want to use.

- In the left column click Security (or click the grid icon → Manage your Google Account → Security). 

- Under “How you sign in to Google” find 2-Step Verification → click it → click Get started (or Turn on) and follow the prompts:

- Enter account password, add a phone number or authenticator app, and verify the second factor. Complete setup. 

- After 2-Step Verification is enabled, Scroll down and click App passwords.

In App passwords:

- Select app: choose Mail (or choose Other (Custom name) and type a recognizable name like gmail-otp-extractor).

- Select device: choose the appropriate device or Other → give a name.

- Click Generate.

- Google will display a 16-character app password (grouped like abcd efgh ijkl mnop). Copy this password now — you will not be able to view it again after closing.

- Put this in your .env (example):

`GMAIL_APP_PASSWORD=abcd efgh ijkl mnop`

- Configure Environment Variables

- Create a .env file in the project root and add:

`GMAIL_API_URL=https://gmail.googleapis.com/gmail/v1/users/me/messages`

`GMAIL_API_TOKEN=<your-oauth2-token>`

`GMAIL_EMAIL=<your-gmail-address>`

`GMAIL_APP_PASSWORD=<your-app-password>`

`base_URLL=<your-application-url>`

`GOOGLE_PASSWORD=<websie-login-password>`

📂 Folder Structure

GMAIL-OTP-LINK-EXTRACTOR-PLAYWRIGHT/
│── 📂 pages # Page Object classes

│ ├── OtpLoginPage.js

│ └── ConfirmationPage.js

│
│── 📂 tests # Test cases (spec files)

│ ├── otp.spec.js

│ └── confirmLink.spec.js

│
│── 📂 utils # Utility/helper functions

│ ├── gmailUtils.js

│ └── helpers.js

│
└── userData.json # Store Test data

## 🛠️ Tech Stack

- Playwright – Browser automation

- Node.js – Runtime environment

- Gmail API / App Password – Accessing emails programmatically

- OAuth 2.0 Playground – To generate Gmail API tokens

- JSON – For storing user data

## Run Tests

# Run all Test

`npx playwright test`

# For Single test

`npx playwright test "./test/otp.spec.js"`
