export class UserLoginPage {
  constructor(page) {
    this.page = page;
    this.loginBtn = page.getByText("LogIn");

    // Frame locator for the iframe
    this.frame = page.frameLocator("#xl_widget iframe");

    // Elements inside the iframe
    this.signUpBtn = this.frame.getByTestId("signUp_tab-link");
    this.emailInput = this.frame.getByTestId("sign-up-form__fields-email");
    this.passwordInput = this.frame.getByTestId("sign-up-form__fields-password");
    this.submitBtn = this.frame.getByTestId("sign-up-form__button-submit");
    this.profileLoggedIn = page.getByRole('img', { name: 'profile_loggedin' });
  }

  async clickLogin(userModel) {
    await this.loginBtn.click();
    await this.signUpBtn.click(); 
    await this.emailInput.fill(userModel.email);
    await this.passwordInput.fill(userModel.password);
    await this.submitBtn.click();
    await this.page.waitForTimeout(5000); 
  }
}
