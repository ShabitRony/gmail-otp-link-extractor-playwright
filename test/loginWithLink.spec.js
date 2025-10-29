import { test, expect } from "@playwright/test";
import { UserLoginPage } from "../pages/UserLoginPage.js";
import { generateRandomUser } from "../utils/generateRandomUser.js";
import dotenv from "dotenv";
import { getLatestEmailDetailsUnified } from "../utils/gmailUtils.js";
dotenv.config();


test("User Login Tests", async ({ page, request }) => {
  // 1️⃣ Go to site
  await page.goto(process.env.BASE_URL);
  const userLoginPage = new UserLoginPage(page);

  // 2️⃣ Generate random test user & trigger signup/login
  const userModel = generateRandomUser();
  await userLoginPage.clickLogin(userModel);

  // 3️⃣ Get confirmation link from email
  const { link } = await getLatestEmailDetailsUnified({method: "API",request});
 
  // 4️⃣ Simulate button click → open link
  await page.goto(link);

  // 5️⃣ Assert user is logged in (example)
  await expect(page).toHaveURL(process.env.BASE_URL); // adjust regex as per your app
  
});
