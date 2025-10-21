# 📌 Playwright Automation – Gmail OTP & Account Confirmation
## This project automates Gmail-based flows using Playwright.
- It covers extracting OTP from Gmail and accessing confirmation links (via Gmail API Token or Gmail App Password).
## 🚀 Features Automated
- Gmail Account Confirmation

- Fetches confirmation email from Gmail.

- Extracts confirmation link from HTML body.
  
- Extracts confirmation link from plain text.

- Clicks Confirm Account button from the email.

- Verifies successful login.

# 🔑 OTP Extraction

- Fetches OTP from Gmail email.

- Extracts OTP from plain text.

- Enters OTP into application OTP field.

# Prerequisites

- Node.js
- installed (v18+ recommended).

- Gmail account with 2-Factor Authentication enabled.(2-Factor authentication optional for Gmail-API-Token)

- A valid OAuth 2.0 token generated from Google OAuth Playground or a Gmail App Password.

# ⚙️ Installation & Setup
- Clone the Repository

`git clone https://github.com/ShabitRony/gmail-otp-link-extractor-playwright`

`cd gmail-otp-link-extractor-playwright`

# Install Dependencies

`npm install`

# Install Playwright Browsers:

`npx playwright install`

#  Gmail Access Setup
## Option 1 — Generate Gmail API token (OAuth 2.0 Playground)

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

### Note: If you’re using the API method, make sure to declare it properly in your test (spec) file as shown below:
```const = await getLatestEmailDetailsUnified({method: "API", request,});```


## Option 2 — Generate Gmail App Password (simpler, for scripts that use SMTP/IMAP clients which don’t support OAuth)

- When to use: quick for personal accounts or development when the app accepts username+password (but not preferable for production). App passwords        require 2-Step Verification on the Google account. 

Step-by-step (desktop / web browser):

### 1. Open https://myaccount.google.com and sign in to the Google account you want to use.

### 2. In the left column click Security (or click the grid icon → Manage your Google Account → Security). 

### 3. Under “How you sign in to Google”, find 2-Step Verification → click it.

 - If not enabled yet, click Get started (or Turn on) and follow the prompts:

 - Enter your account password

 - Add a phone number or authenticator app

 - Verify the second factor and complete setup.

 - If already enabled, simply open the 2-Step Verification page, scroll down, and click App passwords.

  ### 4. In App passwords:

 - Select app: choose Mail (or choose Other (Custom name) and type a recognizable name like gmail-otp-extractor).

 - Select device: choose the appropriate device or Other → give a name.

 - Click Generate.

 - Google will display a 16-character app password (grouped like abcd efgh ijkl mnop). Copy this password now — you will not be able to view it again after closing.

 - Put this in your .env (example):

 `GMAIL_APP_PASSWORD=abcd efgh ijkl mnop`

 - Configure Environment Variables

 - Create a .env file in the project root and add:

`Gmail_URL=https://gmail.googleapis.com/gmail/v1/users/me/messages`

`GMAIL_API_TOKEN=<your-oauth2-token>`

`GMAIL_EMAIL=<your-gmail-address>`

`GMAIL_APP_PASSWORD=<your-app-password>`

`base_URLL=<your-application-url>`

`GOOGLE_PASSWORD=<websie-login-password>`

# Option 3 - 🔐 Gmail API — Client ID & Client Secret Setup
- 
## ⚙️ How to Generate Client ID & Secret (via Web Application)
## 1) Create a Google Cloud project & enable Gmail API
### 1.Go to Google Cloud Console: https://console.cloud.google.com/ and sign in with the Google account you will use.

### 2.At the top, click the project dropdown → New Project.

### 3.Give it a name like my-gmail-integration and click Create.

### 4.With the project selected, open APIs & Services → Library from the left menu.

### 5.Search for Gmail API and click Enable.

## 2) Configure OAuth Consent Screen

### You must configure this before creating OAuth credentials.

### 1.In the Cloud Console, go to APIs & Services → OAuth consent screen.

### 2.Choose External (if you're testing / personal use) and click Create.

### 3.Fill required fields:

- App name (e.g., My Gmail Tool)

- User support email

- Developer contact email

### 4.Optionally add a logo and homepage. For development you can skip most optional fields.

### 5.Under Scopes you can add later — for now, save & continue and finish the basic setup.

## 3) Create OAuth 2.0 Client ID & Client Secret

### 1.Go to APIs & Services → Credentials.

### 2.Click + CREATE CREDENTIALS → OAuth client ID.

### 3.If it asks, configure the consent screen (you already did that).

### 4.Choose Application type: Web application.

### 5.Name it (e.g., local-dev-web-client).

### 6.Important — Authorized redirect URIs: Add the redirect URI you’ll use. Common options:

 - For OAuth 2.0 Playground: https://developers.google.com/oauthplayground

 - For local dev apps: http://localhost:3000 (replace 3000 with your port)

 - If you use OAuth Playground later, make sure you add the Playground URI above.

### 7.Click Create.

- You will see:

`Client ID:     <CLIENT_ID>.apps.googleusercontent.com`

`Client Secret: <CLIENT_SECRET>`


- Copy both and store them securely (e.g., .env).

- Example .env entries:

`GMAIL_CLIENT_ID=<CLIENT_ID>.apps.googleusercontent.com`

`GMAIL_CLIENT_SECRET=<CLIENT_SECRET>`

## If you plan to publish the app or have multiple users, fill these carefully to pass Google verification when needed.

## 4) Use OAuth 2.0 Playground to get tokens (easy, GUI-based)

### OAuth 2.0 Playground is a Google tool that helps you manually run the OAuth flow and inspect tokens. We’ll use it to obtain a refresh token (which your app needs to refresh expired access tokens).

### 1.Open: https://developers.google.com/oauthplayground

### 2.Click the gear icon (top-right) to open Settings.

 - Check: “Use your own OAuth credentials”

 - Paste your Client ID and Client Secret from step 3.

 - Close settings.

### 3.On the left side under “Step 1 — Select & authorize APIs”:

 - Expand Gmail API or paste scopes manually. Common useful scopes:

 - https://mail.google.com/ (full access: read/send/modify)

 - https://www.googleapis.com/auth/gmail.send (send only)

 - https://www.googleapis.com/auth/gmail.readonly (read only)

 - Click the scope(s) you need, then click Authorize APIs.

### 4.A Google sign-in window will open asking you to choose account and grant permissions. Go through it.

### 5.After granting, the Playground will show a redirect URL in the playground UI.

 - If it redirected in your browser address bar, the URL will look like:

`https://developers.google.com/oauthplayground/?code=4/0AbC...&scope=...`


### What to copy: you typically don't have to manually copy the code because the playground can automatically exchange it for tokens. But if your script asks for the authorization code, copy the value of the code parameter from the browser URL (everything after code= until the next &).
 - Example code value:

`4/0AbCDeFgHiJKlmNOpQRsTuVwXyZ123456789`


Copy the refresh_token (and optionally access_token). The playground shows them in a JSON response — copy them to your .env or secure storage.

Example .env:

` GMAIL_CLIENT_ID=<your-client-id>.apps.googleusercontent.com`

`GMAIL_CLIENT_SECRET=<your-client-secret>`

`GMAIL_REFRESH_TOKEN=<refresh-token-you-copied>`

`GMAIL_ACCESS_TOKEN=<optional-current-access-token> `



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

│ ├── generateRandomUser.js

│ └── gmailUtils.js

│ └── gmailUtilsAppPassword.js

│ └── gmailUtilsCombined.js

│ └── loginSetup.js


# 🛠️ Tech Stack

- Playwright – End-to-end browser automation framework for testing and email interaction.

- Node.js – JavaScript runtime for executing Playwright scripts and utility modules.

- Gmail API (OAuth 2.0) – Secure access to Gmail using Client ID, Client Secret, and Refresh Tokens.

- Gmail App Password – Alternative authentication method for IMAP/SMTP clients when OAuth isn’t used.

- OAuth 2.0 Playground – Google’s tool to manually generate and refresh OAuth tokens.

- dotenv – For managing environment variables securely (.env configuration).

- IMAP / Gmail REST API – Fetching OTPs and confirmation links directly from Gmail messages.

- JavaScript (ES6+) – Core scripting language for test logic and utilities.

- JSON – Used for token storage, configuration, and data handling within scripts.

# Run Tests

### Run all Test

`npx playwright test`

### For Single test

`npx playwright test "./test/otp.spec.js"`
