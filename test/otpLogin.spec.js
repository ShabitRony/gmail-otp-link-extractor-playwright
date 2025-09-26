import { test, expect } from '@playwright/test';
import { mitLoginPage } from '../pages/mitLoginPage.js';
import { getLatestEmailDetailsUnified } from '../utils/gmailUtilsCombined.js'; // ✅ only import the unified function

test.describe('MIT Login Flow', () => {
  test('should login successfully with OTP', async ({ page }) => {
    const loginPage = new mitLoginPage(page);

    // Go to login page and enter credentials
    await loginPage.gotoLoginPage();
    await loginPage.loginWithEnvCredentials();
    await loginPage.waitForOtpInput();

    // Fetch OTP via unified function
    // It automatically chooses API token or App Password based on env variables
    const { otp } = await getLatestEmailDetailsUnified(page.request);

    // Fill OTP and verify login
    await loginPage.fillOtpCode(otp);
  });
});

