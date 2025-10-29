import { test, expect } from "@playwright/test";
import { UserLoginPage } from "../pages/UserLoginPage.js";
import { generateRandomUser } from "../utils/generateRandomUser.js";
import dotenv from "dotenv";
import { getLatestEmailDetailsUnified } from "../utils/gmailUtils.js"; 

dotenv.config();

test("User Login Tests", async ({ page }) => {
  // 1️⃣ Go to site
  await page.goto(process.env.BASE_URL);
  const userLoginPage = new UserLoginPage(page);

  // 2️⃣ Generate random test user & trigger signup/login
  const userModel = generateRandomUser();
  await userLoginPage.clickLogin(userModel);

  // 3️⃣ Get confirmation link from Gmail API (auto token refresh handled)
  const {link } = await getLatestEmailDetailsUnified({method:"OAUTH"});

  if (!link) {
    throw new Error("No confirmation link found in email");
  }

  // 4️⃣ Simulate button click → open link
  await page.goto(link);

  // 5️⃣ Assert user is logged in (adjust depending on your app)
  await expect(page).toHaveURL(process.env.BASE_URL);
});
