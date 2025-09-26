// utils/loginSetup.js
import { mitLoginPage } from '../pages/mitLoginPage'; // ✅ match file & class

export async function loginBeforeEachTest(page) {
  const loginPage = new mitLoginPage(page);
  await loginPage.login(); //  this will now work
}
