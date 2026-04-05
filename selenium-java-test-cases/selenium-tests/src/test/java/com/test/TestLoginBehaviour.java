package com.test;

import org.junit.jupiter.api.*;
import org.junit.jupiter.api.MethodOrderer.OrderAnnotation;
import org.openqa.selenium.*;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.support.ui.*;

import io.github.bonigarcia.wdm.WebDriverManager;

import java.time.Duration;

import static org.junit.jupiter.api.Assertions.*;

/**
 * TestLoginBehaviour.java — Fixed version
 *
 * Key fixes vs the broken run:
 * 1. clickLogout() now uses an XPath that finds any button/link with the word
 * "Logout", "Log out", or "Sign out" — no hard-coded CSS class.
 * *** UPDATE the XPath below if your logout element is different ***
 * 2. seedUserInLocalStorage() injects the test account via JS before every
 * test that needs it — no test relies on a previous test's side-effects.
 * 3. Test 6 (cold-start) re-seeds the users array after clearing localStorage
 * so Tests 7-11 are not left without an account.
 * 4. Test 7 seeds the account before testing the wrong-password path so it
 * gets the "wrong password" error instead of "no account found".
 *
 * Tests:
 * 1. New user registration → redirect to dashboard
 * 2. Logout → session cleared → redirected to login
 * 3. Valid credentials → redirect to dashboard
 * 4. Session persists after page refresh
 * 5. Protected route after logout → redirect to login
 * 6. Cold-start direct URL → redirect to login
 * 7. Invalid password → error shown, stays on login
 * 8. Non-existent username → error + auto-switch to sign-up
 * 9. Enter key submits login form
 * 10. Browser back button after logout stays on login
 * 11. Duplicate username → error shown
 * 12. Password too short → error shown
 */
@TestMethodOrder(OrderAnnotation.class)
public class TestLoginBehaviour {

  private static WebDriver driver;
  private static WebDriverWait wait;

  private static final String BASE_URL = "http://localhost:5173";
  private static final String DASHBOARD_URL = BASE_URL + "/dashboard";
  private static final String LOGIN_URL = BASE_URL + "/";

  private static final String TEST_USER = "seleniumUser";
  private static final String TEST_PASS = "Test1234";

  // ── Setup / Teardown ────────────────────────────────────────────────────

  @BeforeAll
  public static void setUp() throws InterruptedException {
    WebDriverManager.chromedriver().setup();
    ChromeOptions options = new ChromeOptions();
    options.addArguments("--start-maximized");
    driver = new ChromeDriver(options);
    wait = new WebDriverWait(driver, Duration.ofSeconds(12));
    System.out.println("========================================");
    System.out.println("  TestLoginBehaviour — START");
    System.out.println("========================================");
    Thread.sleep(500);
  }

  @AfterAll
  public static void tearDown() throws InterruptedException {
    System.out.println("========================================");
    System.out.println("  TestLoginBehaviour — DONE");
    System.out.println("========================================");
    Thread.sleep(2000);
    if (driver != null)
      driver.quit();
  }

  // ── Helpers ─────────────────────────────────────────────────────────────

  private void goToLogin() throws InterruptedException {
    driver.get(LOGIN_URL);
    wait.until(ExpectedConditions.visibilityOfElementLocated(By.className("login-card")));
    Thread.sleep(600);
  }

  private void ensureLoginMode() throws InterruptedException {
    try {
      WebElement btn = driver.findElement(By.className("login-btn"));
      if (btn.getText().equalsIgnoreCase("Sign Up")) {
        driver.findElement(By.className("login-switch-link")).click();
        Thread.sleep(700);
      }
    } catch (NoSuchElementException ignored) {
    }
  }

  private void ensureSignUpMode() throws InterruptedException {
    try {
      WebElement btn = driver.findElement(By.className("login-btn"));
      if (btn.getText().equalsIgnoreCase("Log In")) {
        driver.findElement(By.className("login-switch-link")).click();
        Thread.sleep(700);
      }
    } catch (NoSuchElementException ignored) {
    }
  }

  private void typeUsername(String value) throws InterruptedException {
    WebElement el = wait.until(ExpectedConditions.visibilityOfElementLocated(
        By.cssSelector(".login-input-wrapper input[placeholder='Enter your username']")));
    el.clear();
    for (char c : value.toCharArray()) {
      el.sendKeys(String.valueOf(c));
      Thread.sleep(55);
    }
  }

  private void typePassword(String value) throws InterruptedException {
    WebElement el = driver.findElement(
        By.cssSelector(".login-input-wrapper input[placeholder='Enter your password']"));
    el.clear();
    for (char c : value.toCharArray()) {
      el.sendKeys(String.valueOf(c));
      Thread.sleep(55);
    }
  }

  private void typeConfirmPassword(String value) throws InterruptedException {
    WebElement el = driver.findElement(
        By.cssSelector(".login-input-wrapper input[placeholder='Re-enter your password']"));
    el.clear();
    for (char c : value.toCharArray()) {
      el.sendKeys(String.valueOf(c));
      Thread.sleep(55);
    }
  }

  private void clickSubmit() throws InterruptedException {
    driver.findElement(By.className("login-btn")).click();
    Thread.sleep(1800);
  }

  private String getErrorMessage() {
    try {
      return driver.findElement(By.className("login-error")).getText();
    } catch (NoSuchElementException e) {
      return "";
    }
  }

  private boolean onDashboard() {
    return driver.getCurrentUrl().contains("/dashboard");
  }

  private boolean onLogin() {
    try {
      return driver.findElement(By.className("login-card")).isDisplayed();
    } catch (NoSuchElementException e) {
      return false;
    }
  }

  /**
   * Clicks the logout button / link.
   *
   * *** UPDATE THIS SELECTOR to match your app's logout element. ***
   *
   * To find the right selector:
   * 1. Open http://localhost:5173/dashboard in Chrome while logged in.
   * 2. Right-click the logout button → Inspect.
   * 3. Note its id, class, or text, and update the By.xpath below.
   *
   * Common alternatives:
   * By.id("logout-btn")
   * By.className("logout-btn")
   * By.linkText("Logout")
   * By.xpath("//button[@id='logout']")
   */
  private void clickLogout() throws InterruptedException {
    // ---- UPDATE THIS LINE TO MATCH YOUR APP ----
    WebElement logoutBtn = wait.until(
        ExpectedConditions.elementToBeClickable(
            By.xpath("//*[self::button or self::a][" +
                "contains(translate(text(),'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'logout') or " +
                "contains(translate(text(),'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'log out') or " +
                "contains(translate(text(),'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'sign out')]")));
    // --------------------------------------------
    logoutBtn.click();
    Thread.sleep(1800);
  }

  /**
   * Injects the test account into localStorage so each test that needs a
   * pre-existing user is self-contained — no test depends on Test 1 running.
   *
   * Adjust the localStorage key names to match your storage.js:
   * 'users' → the key used by saveUsers()
   * 'currentUser' → the key used by setCurrentUser()
   */
  private void seedUsersArray() {
    String usersJson = "[{\"username\":\"" + TEST_USER + "\",\"password\":\"" + TEST_PASS + "\"}]";
    ((JavascriptExecutor) driver).executeScript(
        "localStorage.setItem('users', arguments[0]);", usersJson);
  }

  private void seedCurrentUser() {
    String currentUserJson = "{\"username\":\"" + TEST_USER + "\",\"password\":\"" + TEST_PASS + "\"}";
    ((JavascriptExecutor) driver).executeScript(
        "localStorage.setItem('currentUser', arguments[0]);", currentUserJson);
  }

  private void removeCurrentUser() {
    ((JavascriptExecutor) driver).executeScript("localStorage.removeItem('currentUser');");
  }

  /**
   * Seeds a logged-in state via localStorage and navigates to /dashboard.
   * Use at the start of tests that need to begin on the dashboard.
   */
  private void loginViaSeedAndNavigate() throws InterruptedException {
    driver.get(LOGIN_URL);
    Thread.sleep(600);
    seedUsersArray();
    seedCurrentUser();
    driver.get(DASHBOARD_URL);
    Thread.sleep(1800);
    assertTrue(onDashboard(), "Pre-condition: seed login should land on dashboard");
  }

  // ── Tests ────────────────────────────────────────────────────────────────

  /**
   * TEST 1 — Fresh sign-up via the UI redirects to /dashboard.
   */
  @Test
  @Order(1)
  public void testNewUserRegistrationRedirectsToDashboard() throws InterruptedException {
    System.out.println("\n>> [Test 1] New user registration → redirect to dashboard");

    // Start with a clean slate so the username is available
    driver.get(LOGIN_URL);
    Thread.sleep(600);
    ((JavascriptExecutor) driver).executeScript("localStorage.clear();");
    Thread.sleep(300);
    driver.navigate().refresh();
    Thread.sleep(1000);

    ensureSignUpMode();
    typeUsername(TEST_USER);
    typePassword(TEST_PASS);
    typeConfirmPassword(TEST_PASS);

    System.out.println("   Submitting sign-up form...");
    clickSubmit();

    assertTrue(onDashboard(),
        "After sign-up, user should be on dashboard. URL: " + driver.getCurrentUrl());
    System.out.println("   PASS: Redirected to dashboard after registration.");
  }

  /**
   * TEST 2 — Logout clears session and shows the login page.
   */
  @Test
  @Order(2)
  public void testLogoutClearsSessionAndRedirectsToLogin() throws InterruptedException {
    System.out.println("\n>> [Test 2] Logout → session cleared → login page shown");

    loginViaSeedAndNavigate();
    clickLogout();

    assertTrue(onLogin(), "After logout, user should be on the login page.");
    System.out.println("   PASS: Logout correctly redirected to login.");
  }

  /**
   * TEST 3 — Typing valid credentials → redirected to /dashboard.
   */
  @Test
  @Order(3)
  public void testValidCredentialsRedirectsToDashboard() throws InterruptedException {
    System.out.println("\n>> [Test 3] Valid credentials → redirect to dashboard");

    goToLogin();
    seedUsersArray();
    removeCurrentUser();
    driver.navigate().refresh();
    Thread.sleep(1000);

    ensureLoginMode();
    typeUsername(TEST_USER);
    typePassword(TEST_PASS);
    clickSubmit();

    assertTrue(onDashboard(),
        "Valid credentials should redirect to dashboard. URL: " + driver.getCurrentUrl());
    System.out.println("   PASS: Valid credentials accepted, on dashboard.");
  }

  /**
   * TEST 4 — Hard-refresh the dashboard; session should survive (localStorage
   * persists).
   */
  @Test
  @Order(4)
  public void testSessionPersistsAfterRefresh() throws InterruptedException {
    System.out.println("\n>> [Test 4] Session persistence after page refresh");

    loginViaSeedAndNavigate();
    driver.navigate().refresh();
    Thread.sleep(2000);

    assertTrue(onDashboard(),
        "After refresh, user should still be on dashboard (session persisted).");
    System.out.println("   PASS: Session persisted across page refresh.");
  }

  /**
   * TEST 5 — After logout, navigating to /dashboard should redirect to login.
   */
  @Test
  @Order(5)
  public void testProtectedRouteRedirectsToLoginAfterLogout() throws InterruptedException {
    System.out.println("\n>> [Test 5] Direct /dashboard access after logout → redirect to login");

    loginViaSeedAndNavigate();
    clickLogout();
    assertTrue(onLogin(), "Pre-condition: must be logged out first");

    driver.get(DASHBOARD_URL);
    Thread.sleep(2500);

    assertTrue(onLogin(),
        "Unauthenticated access to /dashboard should redirect to login.");
    System.out.println("   PASS: Protected route correctly blocked after logout.");
  }

  /**
   * TEST 6 — Cold start: clear ALL of localStorage, then visit /dashboard.
   * Should redirect to login because there is no currentUser.
   *
   * Fix: after the assertion, re-seed the users array (no currentUser) so
   * Tests 7-11 still have an account to work with.
   */
  @Test
  @Order(6)
  public void testDirectUrlAccessWithoutLoginRedirectsToLogin() throws InterruptedException {
    System.out.println("\n>> [Test 6] Cold-start direct URL access → redirect to login");

    driver.get(LOGIN_URL);
    Thread.sleep(600);
    ((JavascriptExecutor) driver).executeScript("localStorage.clear();");
    Thread.sleep(300);

    driver.get(DASHBOARD_URL);
    Thread.sleep(2500);

    assertTrue(onLogin(),
        "Without any session, /dashboard should redirect to login.");
    System.out.println("   PASS: Unauthenticated direct URL correctly redirected.");

    // Re-seed users array so subsequent tests have an account.
    // currentUser is intentionally NOT set — the user is still logged out.
    seedUsersArray();
  }

  /**
   * TEST 7 — Wrong password for a real account shows an error about the
   * password (not "account not found") and keeps the user on login.
   */
  @Test
  @Order(7)
  public void testInvalidPasswordShowsErrorAndStaysOnLogin() throws InterruptedException {
    System.out.println("\n>> [Test 7] Invalid password → error shown, no redirect");

    goToLogin();
    seedUsersArray(); // account exists
    removeCurrentUser(); // but user is not logged in
    driver.navigate().refresh();
    Thread.sleep(1000);

    ensureLoginMode();
    typeUsername(TEST_USER);
    typePassword("completelyWrongPassword!");
    clickSubmit();

    String error = getErrorMessage();
    System.out.println("   Error message: '" + error + "'");

    assertFalse(error.isEmpty(), "An error should appear for the wrong password.");
    // Make sure it's a password error, not a "no account found" error
    assertFalse(error.toLowerCase().contains("no account"),
        "Error should be about the password, not a missing account. Got: '" + error + "'");
    assertTrue(onLogin(), "User should remain on login page after wrong password.");
    System.out.println("   PASS: Invalid password correctly rejected.");
  }

  /**
   * TEST 8 — A username that does not exist shows an error, then the
   * component auto-switches to sign-up mode after ~1800 ms.
   */
  @Test
  @Order(8)
  public void testNonExistentUsernameShowsErrorAndSwitchesToSignUp() throws InterruptedException {
    System.out.println("\n>> [Test 8] Non-existent username → error + auto-switch to sign-up");

    goToLogin();
    ensureLoginMode();
    typeUsername("ghost_user_xyz_99_never_registered");
    typePassword("doesntmatter");
    clickSubmit();

    String error = getErrorMessage();
    System.out.println("   Immediate error: '" + error + "'");
    assertFalse(error.isEmpty(), "Should show an error for an unknown username.");

    // Component switches to sign-up after 1800 ms — wait a bit longer
    Thread.sleep(2500);
    WebElement btn = driver.findElement(By.className("login-btn"));
    assertEquals("Sign Up", btn.getText(),
        "After 'not found' error, form should auto-switch to sign-up mode.");
    System.out.println("   PASS: Error shown and form switched to sign-up.");
  }

  /**
   * TEST 9 — Pressing Enter on the password field submits the form.
   */
  @Test
  @Order(9)
  public void testEnterKeySubmitsLoginForm() throws InterruptedException {
    System.out.println("\n>> [Test 9] Enter key submits login form");

    goToLogin();
    seedUsersArray();
    removeCurrentUser();
    driver.navigate().refresh();
    Thread.sleep(1000);

    ensureLoginMode();
    typeUsername(TEST_USER);

    WebElement pwField = driver.findElement(
        By.cssSelector(".login-input-wrapper input[placeholder='Enter your password']"));
    pwField.clear();
    for (char c : TEST_PASS.toCharArray()) {
      pwField.sendKeys(String.valueOf(c));
      Thread.sleep(55);
    }

    System.out.println("   Pressing Enter on password field...");
    pwField.sendKeys(Keys.ENTER);
    Thread.sleep(2000);

    assertTrue(onDashboard(),
        "Pressing Enter with valid credentials should redirect to dashboard.");
    System.out.println("   PASS: Enter key triggered login successfully.");
  }

  /**
   * TEST 10 — After logout, the browser back button should not restore the
   * dashboard.
   */
  @Test
  @Order(10)
  public void testBrowserBackButtonAfterLogoutStaysOnLogin() throws InterruptedException {
    System.out.println("\n>> [Test 10] Browser back button after logout → stays on login");

    loginViaSeedAndNavigate();
    assertTrue(onDashboard(), "Pre-condition: must be on dashboard");

    clickLogout();
    assertTrue(onLogin(), "Pre-condition: must be on login page after logout");

    driver.navigate().back();
    Thread.sleep(2500);

    assertTrue(onLogin(),
        "Back button should not bypass the logout and restore the dashboard.");
    System.out.println("   PASS: Back button did not bypass logout protection.");
  }

  /**
   * TEST 11 — Signing up with a username that already exists shows an error.
   * Seeds the existing account first so the duplicate check can fire.
   */
  @Test
  @Order(11)
  public void testDuplicateUsernameOnSignUpShowsError() throws InterruptedException {
    System.out.println("\n>> [Test 11] Duplicate username on sign-up → error shown");

    goToLogin();
    seedUsersArray(); // inject the existing account
    removeCurrentUser();
    driver.navigate().refresh();
    Thread.sleep(1000);

    ensureSignUpMode();
    typeUsername(TEST_USER); // same username — should be rejected
    typePassword(TEST_PASS);
    typeConfirmPassword(TEST_PASS);
    clickSubmit();

    String error = getErrorMessage();
    System.out.println("   Error message: '" + error + "'");
    assertFalse(error.isEmpty(), "Duplicate username should trigger an error.");
    assertTrue(error.toLowerCase().contains("taken") || error.toLowerCase().contains("already"),
        "Error should say the username is taken. Got: '" + error + "'");
    System.out.println("   PASS: Duplicate username correctly rejected.");
  }

  /**
   * TEST 12 — Password shorter than 4 characters shows a validation error
   * and does not create the account.
   */
  @Test
  @Order(12)
  public void testShortPasswordOnSignUpShowsError() throws InterruptedException {
    System.out.println("\n>> [Test 12] Short password on sign-up → error shown");

    goToLogin();
    ensureSignUpMode();
    typeUsername("brandNewUser_" + System.currentTimeMillis());
    typePassword("ab"); // 2 chars — below the 4-char minimum
    typeConfirmPassword("ab");
    clickSubmit();

    String error = getErrorMessage();
    System.out.println("   Error message: '" + error + "'");
    assertFalse(error.isEmpty(), "Too-short password should trigger a validation error.");
    assertFalse(onDashboard(), "User should not be redirected with an invalid password.");
    System.out.println("   PASS: Short password correctly rejected.");
  }
}