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
public class TestInvalidCredentials {

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
    System.out.println("  TestInvalidCredentials — START");
    System.out.println("====================================");
  }

  @AfterAll
  public static void tearDown() throws InterruptedException {
    System.out.println("====================================");
    System.out.println("  TestInvalidCredentials — DONE");
    System.out.println("====================================");
    Thread.sleep(2000);
    if (driver != null)
      driver.quit();
  }

  private void slowType(WebElement el, String text) throws InterruptedException {
    el.clear();
    Thread.sleep(150);
    for (char c : text.toCharArray()) {
      el.sendKeys(String.valueOf(c));
      Thread.sleep(80);
    }
  }

  private String getErrorMessage() {
    try {
      WebElement err = wait.until(
          ExpectedConditions.visibilityOfElementLocated(By.className("login-error")));
      return err.getText();
    } catch (Exception e) {
      return "";
    }
  }

  // Helper — switches to sign up mode if not already there
  private void goToSignUp() throws InterruptedException {
    try {
      WebElement link = wait.until(
          ExpectedConditions.elementToBeClickable(By.className("login-switch-link")));
      if (link.getText().equalsIgnoreCase("Sign up")) {
        link.click();
        Thread.sleep(1200);
      }
    } catch (Exception ignored) {
    }
  }

  // Helper — switches to login mode if not already there
  private void goToLogin() throws InterruptedException {
    try {
      WebElement link = wait.until(
          ExpectedConditions.elementToBeClickable(By.className("login-switch-link")));
      if (link.getText().equalsIgnoreCase("Log in")) {
        link.click();
        Thread.sleep(1200);
      }
    } catch (Exception ignored) {
    }
  }

  // ── TEST 1: Unregistered user is shown error and redirected to sign up ────
  @Test
  @Order(1)
  public void testUnregisteredUserIsRedirectedToSignUp() throws InterruptedException {
    System.out.println("\n>> [Test 1] Logging in with a username that was never registered...");
    Thread.sleep(1000);

    goToLogin();

    WebElement usernameInput = wait.until(
        ExpectedConditions.visibilityOfElementLocated(
            By.cssSelector(".login-input-wrapper input[placeholder='Enter your username']")));
    WebElement passwordInput = driver.findElement(
        By.cssSelector(".login-input-wrapper input[placeholder='Enter your password']"));

    slowType(usernameInput, "ghost_user_xyz");
    slowType(passwordInput, "somepassword");

    System.out.println("   Clicking Log In with unregistered user...");
    driver.findElement(By.className("login-btn")).click();
    Thread.sleep(1500);

    String error = getErrorMessage();
    System.out.println("   Error message shown: '" + error + "'");
    assertFalse(error.isEmpty(), "Should show an error for unregistered user");
    assertTrue(
        error.toLowerCase().contains("sign up") || error.toLowerCase().contains("no account"),
        "Error should tell user to sign up. Got: " + error);

    System.out.println("   PASS: Unregistered user correctly blocked with message.");
    Thread.sleep(2000);

    // Return to login mode for next test
    goToLogin();
  }

  // ── TEST 2: Correct username, wrong password ──────────────────────────────
  @Test
  @Order(2)
  public void testCorrectUsernameWrongPassword() throws InterruptedException {
    System.out.println("\n>> [Test 2] Registering a user, then logging in with wrong password...");
    Thread.sleep(1000);

    // ── STEP A: Sign up as validuser01 ────────────────────────────────────
    System.out.println("   Switching to Sign Up to register 'validuser01'...");
    goToSignUp();

    WebElement u = wait.until(ExpectedConditions.visibilityOfElementLocated(
        By.cssSelector(".login-input-wrapper input[placeholder='Enter your username']")));
    WebElement p = driver.findElement(
        By.cssSelector(".login-input-wrapper input[placeholder='Enter your password']"));
    WebElement c = driver.findElement(
        By.cssSelector(".login-input-wrapper input[placeholder='Re-enter your password']"));

    slowType(u, "validuser01");
    slowType(p, "correctpass");
    slowType(c, "correctpass");

    System.out.println("   Submitting Sign Up form...");
    driver.findElement(By.className("login-btn")).click();
    Thread.sleep(2500); // wait for sign up + possible navigation

    // ── STEP B: Navigate back to login page ───────────────────────────────
    System.out.println("   Navigating back to login page...");
    driver.get(URL);
    Thread.sleep(1500);

    // ── STEP C: Try logging in with wrong password ─────────────────────────
    System.out.println("   Now logging in as 'validuser01' with WRONG password...");
    goToLogin();

    u = wait.until(ExpectedConditions.visibilityOfElementLocated(
        By.cssSelector(".login-input-wrapper input[placeholder='Enter your username']")));
    p = driver.findElement(
        By.cssSelector(".login-input-wrapper input[placeholder='Enter your password']"));

    slowType(u, "validuser01");
    slowType(p, "wrongpassword");

    System.out.println("   Clicking Log In with wrong password...");
    driver.findElement(By.className("login-btn")).click();
    Thread.sleep(1500);

    String error = getErrorMessage();
    System.out.println("   Error message shown: '" + error + "'");

    assertFalse(error.isEmpty(), "Should show error for wrong password");
    assertTrue(
        error.toLowerCase().contains("incorrect") || error.toLowerCase().contains("password"),
        "Error should mention incorrect password. Got: " + error);

    System.out.println("   PASS: Wrong password correctly blocked.");
    Thread.sleep(2000);
  }
}