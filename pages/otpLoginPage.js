import dotenv from 'dotenv';
dotenv.config();
import { getLatestEmailDetailsUnified } from '../utils/gmailUtils.js'; 

export class otpLoginPage {
  constructor(page) {
    this.page = page;
    this.emailInput = page.locator('div').filter({ hasText: /^Email$/ }).locator('div').nth(1).locator('input[type="email"]');
    this.passwordInput = page.locator('div').filter({ hasText: /^Password$/ }).locator('div').nth(1).locator('input[type="password"]');
    this.loginButton = page.getByRole('button', { name: 'Log in' });
  }

  async login() {
    await this.gotoLoginPage();
    await this.loginWithEnvCredentials();
    await this.waitForOtpInput();
    await this.fillOtpCode();
  }

  async gotoLoginPage() {
    await this.page.goto(process.env.BASE_URL);
  }

  async loginWithEnvCredentials() {
    const email = process.env.GMAIL_EMAIL;
    const password = process.env.GOOGLE_PASSWORD;
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async waitForOtpInput() {
    await this.page.waitForSelector('[data-testid="input-code-1"]', {
      timeout: parseInt(process.env.TIMEOUT) || 30000,
    });
  }

  async fillOtpCode(retries = 3) {
    let otp = null;
    for (let attempt = 1; attempt <= retries; attempt++) {
      if (!otp) {
        otp = (await getLatestEmailDetailsUnified(this.page.request)).otp;
        // console.log(`Fetched OTP (Attempt ${attempt}):`, otp);
      }

      for (let i = 0; i < 6; i++) {
        await this.page.getByTestId(`input-code-${i + 1}`).fill(otp[i]);
      }

      await this.page.getByRole('button', { name: 'Verify' }).click();

      try {
        await this.page.getByRole('link', { name: 'All projects' }).waitFor({ timeout: 8000 });
        await this.page.getByRole('link', { name: 'All projects' }).click();
        await this.page.waitForURL(/.*projects/, { timeout: 8000 });

      
        return;
      } catch {
        if (attempt < retries) otp = null;
        else throw new Error('OTP verification failed after retries');
      }
    }
  }
}
