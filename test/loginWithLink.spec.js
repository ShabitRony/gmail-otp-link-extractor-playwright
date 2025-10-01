import { test, expect } from "@playwright/test";
import { UserLoginPage } from "../pages/UserLoginPage.js";
// import { getLatestEmailDetails } from "../utils/gmailUtils.js"; // ✅ no need for getConfirmationLink
import { generateRandomUser } from "../utils/generateRandomUser.js";
import dotenv from "dotenv";
import { getLatestEmailDetailsUnified } from "../utils/gmailUtilsCombined.js";
dotenv.config();


test("User Login Tests", async ({ page, request }) => {
  // 1️⃣ Go to site
  await page.goto(process.env.base_URL);
  const userLoginPage = new UserLoginPage(page);

  // 2️⃣ Generate random test user & trigger signup/login
  const userModel = generateRandomUser();
  await userLoginPage.clickLogin(userModel);

  // 3️⃣ Get confirmation link from email
  const { link } = await getLatestEmailDetailsUnified({method: "API",request});
 
  // 4️⃣ Simulate button click → open link
  await page.goto(link);

  // 5️⃣ Assert user is logged in (example)
  await expect(page).toHaveURL(process.env.base_URL); // adjust regex as per your app
  
});
