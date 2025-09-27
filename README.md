## 📌 Playwright Automation – Gmail OTP & Account Confirmation
# This project automates Gmail-based flows using Playwright.
-It covers extracting OTP from Gmail and accessing confirmation links (via Gmail API Token or Gmail App Password).
## 🚀 Features Automated
-✅ Gmail Account Confirmation

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

## 📧 Gmail Access Setup
- Option 1: Generate Gmail API Token using OAuth 2.0 Playground

- Visit OAuth 2.0 Playground.

- On the left side, scroll down or search Gmail API v1.

- Check ✅ https://www.googleapis.com/auth/gmail.readonly

- This gives your app read-only access to emails.

- Click Authorize APIs.

- Sign in with your Gmail account and allow access.

- Copy the access token and place it in .env.

- Option 2: Generate Gmail App Password

- Enable 2-Step Verification in your Google Account.

- Click Generate an App Password for Mail.

- Copy the generated password and place it in .env.

- Configure Environment Variables

- Create a .env file in the project root and add:

``GMAIL_API_URL=https://gmail.googleapis.com/gmail/v1/users/me/messages
GMAIL_API_TOKEN=<your-oauth2-token>
GMAIL_USER=<your-gmail-address>
GMAIL_APP_PASSWORD=<your-app-password>
APP_BASE_URL=<your-application-url>``

📂 Folder Structure

GMAIL-OTP-LINK-EXTRACTOR-PLAYWRIGHT/
│── 📂 pages # Page Object classes
│ ├── OtpPage.js
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

`npx playwright test "./tests/otp.spec.js"`
