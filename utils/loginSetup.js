// utils/loginSetup.js
import { otpLoginPage } from '../pages/otpLoginPage'; // ✅ match file & class

export async function loginBeforeEachTest(page) {
  const loginPage = new otpLoginPage(page);
  await loginPage.login(); //  this will now work
}
