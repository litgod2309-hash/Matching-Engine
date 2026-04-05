package com.test;

import org.junit.jupiter.api.*;
import org.junit.jupiter.api.MethodOrderer.OrderAnnotation;
import org.openqa.selenium.*;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.ui.*;

import io.github.bonigarcia.wdm.WebDriverManager;

import java.time.Duration;

import static org.junit.jupiter.api.Assertions.*;

@TestMethodOrder(OrderAnnotation.class)
public class TestMaliciousInput {

  private static WebDriver driver;
  private static WebDriverWait wait;

  private static final String URL = "http://localhost:5173";

  @BeforeAll
  public static void setUp() throws InterruptedException {
    WebDriverManager.chromedriver().setup();
    driver = new ChromeDriver();
    wait = new WebDriverWait(driver, Duration.ofSeconds(10));
    driver.get(URL);
    Thread.sleep(2000);
    System.out.println("====================================");
    System.out.println("  TestMaliciousInput — START");
    System.out.println("====================================");
  }

  @AfterAll
  public static void tearDown() throws InterruptedException {
    System.out.println("====================================");
    System.out.println("  TestMaliciousInput — DONE");
    System.out.println("====================================");
    Thread.sleep(2000);
    if (driver != null)
      driver.quit();
  }

  private void clearAndType(WebElement el, String text) throws InterruptedException {
    el.clear();
    Thread.sleep(200);
    // For long strings, sendKeys all at once is fine — typing char by char would
    // take forever
    el.sendKeys(text);
    Thread.sleep(400);
  }

  private void clickLogin() throws InterruptedException {
    driver.findElement(By.className("login-btn")).click();
    Thread.sleep(1500);
  }

  private String getErrorMessage() {
    try {
      return driver.findElement(By.className("login-error")).getText();
    } catch (NoSuchElementException e) {
      return "";
    }
  }

  private boolean isStillOnLoginPage() {
    return driver.getCurrentUrl().contains("localhost:5173")
        && !driver.getCurrentUrl().contains("dashboard");
  }

  // ── TEST 1: SQL injection in username field ───────────────────────────────
  @Test
  @Order(1)
  public void testSqlInjectionInUsername() throws InterruptedException {
    System.out.println("\n>> [Test 1] Entering SQL injection payload into username field...");
    Thread.sleep(1000);

    String sqlPayload = "' OR 1=1 --";

    WebElement usernameInput = wait.until(
        ExpectedConditions.visibilityOfElementLocated(
            By.cssSelector(".login-input-wrapper input[placeholder='Enter your username']")));
    WebElement passwordInput = driver.findElement(
        By.cssSelector(".login-input-wrapper input[placeholder='Enter your password']"));

    clearAndType(usernameInput, sqlPayload);
    clearAndType(passwordInput, "anypassword");

    System.out.println("   SQL payload typed: " + sqlPayload);
    System.out.println("   Clicking Log In...");
    clickLogin();

    // App should NOT navigate away — must stay on login page
    assertTrue(isStillOnLoginPage(), "SQL injection should NOT bypass login");

    String error = getErrorMessage();
    System.out.println("   Still on login page: YES");
    System.out.println("   Error message: '" + error + "'");
    System.out.println("   PASS: SQL injection did not bypass the login.");
    Thread.sleep(2000);
  }

  // ── TEST 2: SQL injection in password field ───────────────────────────────
  @Test
  @Order(2)
  public void testSqlInjectionInPassword() throws InterruptedException {
    System.out.println("\n>> [Test 2] Entering SQL injection payload into password field...");
    Thread.sleep(1000);

    WebElement usernameInput = driver.findElement(
        By.cssSelector(".login-input-wrapper input[placeholder='Enter your username']"));
    WebElement passwordInput = driver.findElement(
        By.cssSelector(".login-input-wrapper input[placeholder='Enter your password']"));

    clearAndType(usernameInput, "normaluser");
    clearAndType(passwordInput, "' OR '1'='1");

    System.out.println("   SQL payload in password: ' OR '1'='1");
    System.out.println("   Clicking Log In...");
    clickLogin();

    assertTrue(isStillOnLoginPage(), "SQL injection in password should NOT bypass login");
    System.out.println("   Still on login page: YES");
    System.out.println("   PASS: SQL injection in password did not bypass login.");
    Thread.sleep(2000);
  }

  // ── TEST 3: Very long username (500 chars) ────────────────────────────────
  @Test
  @Order(3)
  public void testVeryLongUsername() throws InterruptedException {
    System.out.println("\n>> [Test 3] Typing a 500-character username...");
    Thread.sleep(1000);

    String longUsername = "a".repeat(500);

    WebElement usernameInput = driver.findElement(
        By.cssSelector(".login-input-wrapper input[placeholder='Enter your username']"));
    WebElement passwordInput = driver.findElement(
        By.cssSelector(".login-input-wrapper input[placeholder='Enter your password']"));

    clearAndType(usernameInput, longUsername);
    clearAndType(passwordInput, "somepassword");

    System.out.println("   500-char username entered. Clicking Log In...");
    clickLogin();

    // App should not crash — it should either show an error or stay on login
    assertTrue(isStillOnLoginPage(), "Very long username should not bypass login or crash the app");
    System.out.println("   App did not crash. Still on login page.");
    System.out.println("   PASS: Very long username handled gracefully.");
    Thread.sleep(2000);
  }

  // ── TEST 4: Very long password (500 chars) ────────────────────────────────
  @Test
  @Order(4)
  public void testVeryLongPassword() throws InterruptedException {
    System.out.println("\n>> [Test 4] Typing a 500-character password...");
    Thread.sleep(1000);

    String longPassword = "p".repeat(500);

    WebElement usernameInput = driver.findElement(
        By.cssSelector(".login-input-wrapper input[placeholder='Enter your username']"));
    WebElement passwordInput = driver.findElement(
        By.cssSelector(".login-input-wrapper input[placeholder='Enter your password']"));

    clearAndType(usernameInput, "normaluser");
    clearAndType(passwordInput, longPassword);

    System.out.println("   500-char password entered (shown as dots). Clicking Log In...");
    clickLogin();

    assertTrue(isStillOnLoginPage(), "Very long password should not bypass login or crash the app");
    System.out.println("   App did not crash. Still on login page.");
    System.out.println("   PASS: Very long password handled gracefully.");
    Thread.sleep(2000);
  }

  // ── TEST 5: Special characters in both fields ─────────────────────────────
  @Test
  @Order(5)
  public void testSpecialCharactersInput() throws InterruptedException {
    System.out.println("\n>> [Test 5] Entering special characters in both fields...");
    Thread.sleep(1000);

    String specialChars = "!@#$%^&*()<>?/\\|{}[]~`";

    WebElement usernameInput = driver.findElement(
        By.cssSelector(".login-input-wrapper input[placeholder='Enter your username']"));
    WebElement passwordInput = driver.findElement(
        By.cssSelector(".login-input-wrapper input[placeholder='Enter your password']"));

    clearAndType(usernameInput, specialChars);
    clearAndType(passwordInput, specialChars);

    System.out.println("   Special chars entered: " + specialChars);
    System.out.println("   Clicking Log In...");
    clickLogin();

    assertTrue(isStillOnLoginPage(), "Special characters should not bypass login");
    System.out.println("   App did not crash. Still on login page.");
    System.out.println("   PASS: Special character input handled gracefully.");
    Thread.sleep(2000);
  }
}