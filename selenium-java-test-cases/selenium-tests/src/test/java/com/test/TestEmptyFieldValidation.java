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
public class TestEmptyFieldValidation {

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
    System.out.println("  TestEmptyFieldValidation — START");
    System.out.println("====================================");
  }

  @AfterAll
  public static void tearDown() throws InterruptedException {
    System.out.println("====================================");
    System.out.println("  TestEmptyFieldValidation — DONE");
    System.out.println("====================================");
    Thread.sleep(2000);
    if (driver != null)
      driver.quit();
  }

  private String getErrorMessage() {
    try {
      return driver.findElement(By.className("login-error")).getText();
    } catch (NoSuchElementException e) {
      return "";
    }
  }

  private void clearAllFields() throws InterruptedException {
    try {
      driver.findElement(By.cssSelector(".login-input-wrapper input[placeholder='Enter your username']")).clear();
      driver.findElement(By.cssSelector(".login-input-wrapper input[placeholder='Enter your password']")).clear();
    } catch (NoSuchElementException ignored) {
    }
    Thread.sleep(300);
  }

  // ── TEST 1: Click Log In with both fields empty ───────────────────────────
  @Test
  @Order(1)
  public void testBothFieldsEmptyOnLogin() throws InterruptedException {
    System.out.println("\n>> [Test 1] Clicking Log In with both fields completely empty...");
    Thread.sleep(1000);

    clearAllFields();
    driver.findElement(By.className("login-btn")).click();
    Thread.sleep(1500);

    String error = getErrorMessage();
    System.out.println("   Error message shown: '" + error + "'");
    assertFalse(error.isEmpty(), "Should show an error when both fields are empty");
    System.out.println("   PASS: Empty form submission blocked correctly.");
    Thread.sleep(2000);
  }

  // ── TEST 2: Username filled, password empty ───────────────────────────────
  @Test
  @Order(2)
  public void testPasswordEmptyOnLogin() throws InterruptedException {
    System.out.println("\n>> [Test 2] Filling username but leaving password empty...");
    Thread.sleep(1000);

    clearAllFields();

    WebElement usernameInput = driver.findElement(
        By.cssSelector(".login-input-wrapper input[placeholder='Enter your username']"));
    usernameInput.click();
    for (char c : "someuser".toCharArray()) {
      usernameInput.sendKeys(String.valueOf(c));
      Thread.sleep(100);
    }

    System.out.println("   Username typed. Password left empty. Clicking Log In...");
    Thread.sleep(500);
    driver.findElement(By.className("login-btn")).click();
    Thread.sleep(1500);

    String error = getErrorMessage();
    System.out.println("   Error message shown: '" + error + "'");
    assertFalse(error.isEmpty(), "Should show error when password is empty");
    System.out.println("   PASS: Empty password correctly blocked.");
    Thread.sleep(2000);
  }

  // ── TEST 3: Password filled, username empty ───────────────────────────────
  @Test
  @Order(3)
  public void testUsernameEmptyOnLogin() throws InterruptedException {
    System.out.println("\n>> [Test 3] Leaving username empty but filling password...");
    Thread.sleep(1000);

    clearAllFields();

    WebElement passwordInput = driver.findElement(
        By.cssSelector(".login-input-wrapper input[placeholder='Enter your password']"));
    passwordInput.click();
    for (char c : "somepassword".toCharArray()) {
      passwordInput.sendKeys(String.valueOf(c));
      Thread.sleep(100);
    }

    System.out.println("   Password typed. Username left empty. Clicking Log In...");
    Thread.sleep(500);
    driver.findElement(By.className("login-btn")).click();
    Thread.sleep(1500);

    String error = getErrorMessage();
    System.out.println("   Error message shown: '" + error + "'");
    assertFalse(error.isEmpty(), "Should show error when username is empty");
    System.out.println("   PASS: Empty username correctly blocked.");
    Thread.sleep(2000);
  }

  // ── TEST 4: Empty fields on Sign Up form ─────────────────────────────────
  @Test
  @Order(4)
  public void testEmptyFieldsOnSignUp() throws InterruptedException {
    System.out.println("\n>> [Test 4] Switching to Sign Up and submitting with all fields empty...");
    Thread.sleep(1000);

    WebElement switchLink = wait.until(
        ExpectedConditions.elementToBeClickable(By.className("login-switch-link")));
    if (switchLink.getText().equalsIgnoreCase("Sign up")) {
      switchLink.click();
      Thread.sleep(1200);
      System.out.println("   Switched to Sign Up form.");
    }

    System.out.println("   Clicking Sign Up with all fields empty...");
    driver.findElement(By.className("login-btn")).click();
    Thread.sleep(1500);

    String error = getErrorMessage();
    System.out.println("   Error message shown: '" + error + "'");
    assertFalse(error.isEmpty(), "Should show error when sign up fields are empty");
    System.out.println("   PASS: Empty sign up form correctly blocked.");
    Thread.sleep(2000);

    // Switch back to login for cleanup
    WebElement backLink = driver.findElement(By.className("login-switch-link"));
    if (backLink.getText().equalsIgnoreCase("Log in")) {
      backLink.click();
      Thread.sleep(1000);
    }
  }

  // ── TEST 5: Sign Up with mismatched passwords ─────────────────────────────
  @Test
  @Order(5)
  public void testMismatchedPasswordsOnSignUp() throws InterruptedException {
    System.out.println("\n>> [Test 5] Signing up with passwords that do not match...");
    Thread.sleep(1000);

    WebElement switchLink = wait.until(
        ExpectedConditions.elementToBeClickable(By.className("login-switch-link")));
    if (switchLink.getText().equalsIgnoreCase("Sign up")) {
      switchLink.click();
      Thread.sleep(1200);
    }

    WebElement usernameInput = driver.findElement(
        By.cssSelector(".login-input-wrapper input[placeholder='Enter your username']"));
    WebElement passwordInput = driver.findElement(
        By.cssSelector(".login-input-wrapper input[placeholder='Enter your password']"));
    WebElement confirmInput = driver.findElement(
        By.cssSelector(".login-input-wrapper input[placeholder='Re-enter your password']"));

    usernameInput.clear();
    passwordInput.clear();
    confirmInput.clear();

    for (char c : "newuser99".toCharArray()) {
      usernameInput.sendKeys(String.valueOf(c));
      Thread.sleep(90);
    }
    for (char c : "password123".toCharArray()) {
      passwordInput.sendKeys(String.valueOf(c));
      Thread.sleep(90);
    }
    for (char c : "differentpass".toCharArray()) {
      confirmInput.sendKeys(String.valueOf(c));
      Thread.sleep(90);
    }

    System.out.println("   Passwords entered don't match. Clicking Sign Up...");
    Thread.sleep(500);
    driver.findElement(By.className("login-btn")).click();
    Thread.sleep(1500);

    String error = getErrorMessage();
    System.out.println("   Error message shown: '" + error + "'");
    assertFalse(error.isEmpty(), "Should show error for mismatched passwords");
    assertTrue(error.toLowerCase().contains("match"), "Error should mention passwords not matching");
    System.out.println("   PASS: Mismatched passwords correctly blocked.");
    Thread.sleep(2000);
  }
}