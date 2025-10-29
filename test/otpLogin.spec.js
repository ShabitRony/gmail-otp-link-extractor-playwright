import { test, expect } from '@playwright/test';
import { otpLoginPage } from '../pages/otpLoginPage.js';
import { getLatestEmailDetailsUnified } from '../utils/gmailUtils.js';

test.describe('MIT Login Flow', () => {
  test('should login successfully with OTP', async ({ page }) => {
    const loginPage = new otpLoginPage(page);

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

