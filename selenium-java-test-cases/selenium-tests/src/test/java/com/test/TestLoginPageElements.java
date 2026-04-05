package com.test;

import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.junit.jupiter.api.MethodOrderer.OrderAnnotation;
import org.junit.jupiter.api.Order;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import io.github.bonigarcia.wdm.WebDriverManager;

import java.time.Duration;

import static org.junit.jupiter.api.Assertions.*;

@TestMethodOrder(OrderAnnotation.class)
public class TestLoginPageElements {

  private static WebDriver driver;
  private static WebDriverWait wait;

  @BeforeAll
  public static void setUp() throws InterruptedException {
    WebDriverManager.chromedriver().setup();
    driver = new ChromeDriver();
    wait = new WebDriverWait(driver, Duration.ofSeconds(10));

    System.out.println(">> Opening Stock Engine login page...");
    driver.get("http://localhost:5173");
    Thread.sleep(2000);
  }

  @AfterAll
  public static void tearDown() throws InterruptedException {
    System.out.println(">> All login page tests done. Closing browser...");
    Thread.sleep(2000);
    if (driver != null) {
      driver.quit();
    }
  }

  // ── TEST 1: Heading reads "Welcome Back!" ─────────────────────────────────
  @Test
  @Order(1)
  public void testHeadingReadsWelcomeBack() throws InterruptedException {
    System.out.println(">> [Test 1] Checking page heading...");
    Thread.sleep(1000);

    WebElement heading = wait.until(
        ExpectedConditions.visibilityOfElementLocated(By.className("login-logo")));

    System.out.println("   Heading found: " + heading.getText());
    assertEquals("Welcome Back!", heading.getText(), "Heading should read 'Welcome Back!'");
    System.out.println("   PASS: Heading is correct.");
    Thread.sleep(1500);
  }

  // ── TEST 2: Tagline is not empty ──────────────────────────────────────────
  @Test
  @Order(2)
  public void testTaglineIsNotEmpty() throws InterruptedException {
    System.out.println(">> [Test 2] Checking tagline text...");
    Thread.sleep(1000);

    WebElement tagline = wait.until(
        ExpectedConditions.visibilityOfElementLocated(By.className("login-tagline")));

    System.out.println("   Tagline found: " + tagline.getText());
    assertFalse(tagline.getText().isEmpty(), "Tagline should not be empty");
    System.out.println("   PASS: Tagline is present.");
    Thread.sleep(1500);
  }

  // ── TEST 3: Username input — visible, enabled, and accepts typing ─────────
  @Test
  @Order(3)
  public void testUsernameInputIsVisibleAndEnabled() throws InterruptedException {
    System.out.println(">> [Test 3] Checking username input...");
    Thread.sleep(1000);

    WebElement usernameInput = wait.until(
        ExpectedConditions.visibilityOfElementLocated(
            By.cssSelector(".login-input-wrapper input[placeholder='Enter your username']")));

    assertTrue(usernameInput.isDisplayed(), "Username input should be visible");
    assertTrue(usernameInput.isEnabled(), "Username input should be enabled");

    // Type character by character so you can watch it on screen
    System.out.println("   Typing 'testuser' into username field...");
    usernameInput.click();
    for (char c : "testuser".toCharArray()) {
      usernameInput.sendKeys(String.valueOf(c));
      Thread.sleep(120);
    }

    assertEquals("testuser", usernameInput.getAttribute("value"), "Username field should contain typed text");
    System.out.println("   PASS: Username input works correctly.");
    Thread.sleep(1500);

    // Clear it after the test so the field is clean for next test
    usernameInput.clear();
    Thread.sleep(500);
  }

  // ── TEST 4: Password input — visible and masked ───────────────────────────
  @Test
  @Order(4)
  public void testPasswordInputIsVisibleAndMasked() throws InterruptedException {
    System.out.println(">> [Test 4] Checking password input...");
    Thread.sleep(1000);

    WebElement passwordInput = wait.until(
        ExpectedConditions.visibilityOfElementLocated(
            By.cssSelector(".login-input-wrapper input[placeholder='Enter your password']")));

    assertTrue(passwordInput.isDisplayed(), "Password input should be visible");
    assertEquals("password", passwordInput.getAttribute("type"), "Password field type should be 'password'");

    // Type a password visibly (it'll show as dots on screen)
    System.out.println("   Typing 'secret123' into password field (masked)...");
    passwordInput.click();
    for (char c : "secret123".toCharArray()) {
      passwordInput.sendKeys(String.valueOf(c));
      Thread.sleep(120);
    }

    System.out.println("   PASS: Password input is masked correctly.");
    Thread.sleep(1500);

    passwordInput.clear();
    Thread.sleep(500);
  }

  // ── TEST 5: Login button is visible and clickable ─────────────────────────
  @Test
  @Order(5)
  public void testLoginButtonIsVisible() throws InterruptedException {
    System.out.println(">> [Test 5] Checking Log In button...");
    Thread.sleep(1000);

    WebElement loginBtn = wait.until(
        ExpectedConditions.elementToBeClickable(By.className("login-btn")));

    assertTrue(loginBtn.isDisplayed(), "Login button should be visible");
    assertEquals("Log In", loginBtn.getText(), "Login button should read 'Log In'");
    System.out.println("   PASS: Log In button is visible and clickable.");
    Thread.sleep(1500);
  }

  // ── TEST 6: Sign up link switches the form to Sign Up mode ───────────────
  @Test
  @Order(6)
  public void testSignUpSwitchLinkChangesForm() throws InterruptedException {
    System.out.println(">> [Test 6] Clicking 'Sign up' link to switch mode...");
    Thread.sleep(1000);

    WebElement switchLink = wait.until(
        ExpectedConditions.elementToBeClickable(By.className("login-switch-link")));

    assertEquals("Sign up", switchLink.getText(), "Switch link should read 'Sign up'");

    // Click it — you'll see the form switch to Sign Up on screen
    switchLink.click();
    Thread.sleep(1500);

    // After switching, heading should now say "Create Account"
    WebElement heading = wait.until(
        ExpectedConditions.visibilityOfElementLocated(By.className("login-logo")));
    System.out.println("   Heading after switch: " + heading.getText());
    assertEquals("Create Account", heading.getText(), "After clicking Sign up, heading should read 'Create Account'");
    System.out.println("   PASS: Form switched to Sign Up mode correctly.");
    Thread.sleep(2000);
  }
}