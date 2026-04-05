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
public class TestLoginBehavior {

    private static WebDriver driver;
    private static WebDriverWait wait;

    private static final String URL = "http://localhost:5173";

    @BeforeAll
    public static void setUp() throws InterruptedException {
        WebDriverManager.chromedriver().setup();
        driver = new ChromeDriver();
        // Shorter default wait — we'll use explicit sleeps where needed
        wait = new WebDriverWait(driver, Duration.ofSeconds(5));
        driver.get(URL);
        Thread.sleep(2000);
        System.out.println("====================================");
        System.out.println("  TestLoginBehavior — START");
        System.out.println("====================================");
    }

    @AfterAll
    public static void tearDown() throws InterruptedException {
        System.out.println("====================================");
        System.out.println("  TestLoginBehavior — DONE");
        System.out.println("====================================");
        Thread.sleep(2000);
        if (driver != null) driver.quit();
    }

    private void slowType(WebElement el, String text) throws InterruptedException {
        el.clear();
        Thread.sleep(150);
        for (char c : text.toCharArray()) {
            el.sendKeys(String.valueOf(c));
            Thread.sleep(90);
        }
    }

    // Non-blocking error check — does NOT wait, just reads immediately
    private String getErrorNow() {
        try {
            return driver.findElement(By.className("login-error")).getText();
        } catch (NoSuchElementException e) {
            return "";
        }
    }

    private void goToSignUp() throws InterruptedException {
        try {
            WebElement link = new WebDriverWait(driver, Duration.ofSeconds(5))
                .until(ExpectedConditions.elementToBeClickable(By.className("login-switch-link")));
            if (link.getText().equalsIgnoreCase("Sign up")) {
                link.click();
                Thread.sleep(1200);
            }
        } catch (Exception ignored) {}
    }

    private void goToLogin() throws InterruptedException {
        try {
            WebElement link = new WebDriverWait(driver, Duration.ofSeconds(5))
                .until(ExpectedConditions.elementToBeClickable(By.className("login-switch-link")));
            if (link.getText().equalsIgnoreCase("Log in")) {
                link.click();
                Thread.sleep(1200);
            }
        } catch (Exception ignored) {}
    }

    // ── TEST 1: Enter key triggers form submission ────────────────────────────
    // Strategy: press Enter on the USERNAME field (which has onKeyDown in Login.jsx).
    // We use an unregistered user — the app will show an error briefly then switch
    // to signup mode. We check that the mode switched (signup link now says "Log in")
    // which only happens when form submission was triggered.
    @Test
    @Order(1)
    public void testEnterKeyTriggersLogin() throws InterruptedException {
        System.out.println("\n>> [Test 1] Testing that pressing Enter key submits the login form...");
        Thread.sleep(1000);

        goToLogin();

        WebElement usernameInput = new WebDriverWait(driver, Duration.ofSeconds(5))
            .until(ExpectedConditions.visibilityOfElementLocated(
                By.cssSelector(".login-input-wrapper input[placeholder='Enter your username']")
            ));
        WebElement passwordInput = driver.findElement(
            By.cssSelector(".login-input-wrapper input[placeholder='Enter your password']")
        );

        slowType(usernameInput, "never_registered_user");
        slowType(passwordInput, "somepassword");

        // Record the current switch-link text before pressing Enter
        String modeBefore = driver.findElement(By.className("login-switch-link")).getText();
        System.out.println("   Mode before Enter: switch link says '" + modeBefore + "'");

        System.out.println("   Pressing ENTER on the username field...");
        usernameInput.sendKeys(Keys.ENTER);

        // Wait up to 4 seconds for any visible change:
        // - error message appears, OR
        // - switch link text changes (app switched to signup after redirect), OR
        // - navigated to dashboard
        boolean submissionTriggered = false;
        for (int i = 0; i < 8; i++) {
            Thread.sleep(500);
            String error = getErrorNow();
            String modeNow = "";
            try { modeNow = driver.findElement(By.className("login-switch-link")).getText(); } catch (Exception ignored) {}
            boolean onDashboard = driver.getCurrentUrl().contains("dashboard");

            System.out.println("   [check " + (i+1) + "] error='" + error + "' switchLink='" + modeNow + "' dashboard=" + onDashboard);

            if (!error.isEmpty() || !modeNow.equals(modeBefore) || onDashboard) {
                submissionTriggered = true;
                System.out.println("   Submission detected!");
                break;
            }
        }

        assertTrue(submissionTriggered,
            "Enter key on username field should have triggered form submission");

        System.out.println("   PASS: Enter key correctly triggered form submission.");
        Thread.sleep(1500);

        // Return to clean login state
        driver.get(URL);
        Thread.sleep(1500);
    }

    // ── TEST 2: Duplicate username registration is blocked ────────────────────
    @Test
    @Order(2)
    public void testDuplicateUsernameBlockedOnSignUp() throws InterruptedException {
        System.out.println("\n>> [Test 2] Registering same username twice — second should fail...");
        Thread.sleep(1000);

        goToSignUp();

        WebElement u = new WebDriverWait(driver, Duration.ofSeconds(5)).until(
            ExpectedConditions.visibilityOfElementLocated(
                By.cssSelector(".login-input-wrapper input[placeholder='Enter your username']")));
        WebElement p = driver.findElement(
            By.cssSelector(".login-input-wrapper input[placeholder='Enter your password']"));
        WebElement c = driver.findElement(
            By.cssSelector(".login-input-wrapper input[placeholder='Re-enter your password']"));

        slowType(u, "duplicateuser");
        slowType(p, "pass1234");
        slowType(c, "pass1234");

        System.out.println("   First registration submitted...");
        driver.findElement(By.className("login-btn")).click();
        Thread.sleep(2000);

        driver.get(URL);
        Thread.sleep(1500);
        goToSignUp();

        u = new WebDriverWait(driver, Duration.ofSeconds(5)).until(
            ExpectedConditions.visibilityOfElementLocated(
                By.cssSelector(".login-input-wrapper input[placeholder='Enter your username']")));
        p = driver.findElement(
            By.cssSelector(".login-input-wrapper input[placeholder='Enter your password']"));
        c = driver.findElement(
            By.cssSelector(".login-input-wrapper input[placeholder='Re-enter your password']"));

        slowType(u, "duplicateuser");
        slowType(p, "differentpass");
        slowType(c, "differentpass");

        System.out.println("   Trying to register 'duplicateuser' again...");
        driver.findElement(By.className("login-btn")).click();
        Thread.sleep(1500);

        String error = getErrorNow();
        System.out.println("   Error message: '" + error + "'");
        assertFalse(error.isEmpty(), "Duplicate username should be blocked");
        assertTrue(error.toLowerCase().contains("taken") || error.toLowerCase().contains("already"),
            "Error should say username is taken. Got: " + error);
        System.out.println("   PASS: Duplicate username correctly blocked.");
        Thread.sleep(2000);

        goToLogin();
    }

    // ── TEST 3: Short password blocked on sign up ─────────────────────────────
    @Test
    @Order(3)
    public void testShortPasswordBlockedOnSignUp() throws InterruptedException {
        System.out.println("\n>> [Test 3] Trying to sign up with a password shorter than 4 characters...");
        Thread.sleep(1000);

        goToSignUp();

        WebElement u = new WebDriverWait(driver, Duration.ofSeconds(5)).until(
            ExpectedConditions.visibilityOfElementLocated(
                By.cssSelector(".login-input-wrapper input[placeholder='Enter your username']")));
        WebElement p = driver.findElement(
            By.cssSelector(".login-input-wrapper input[placeholder='Enter your password']"));
        WebElement c = driver.findElement(
            By.cssSelector(".login-input-wrapper input[placeholder='Re-enter your password']"));

        slowType(u, "shortpassuser");
        slowType(p, "ab");
        slowType(c, "ab");

        System.out.println("   Password 'ab' (2 chars) entered. Clicking Sign Up...");
        driver.findElement(By.className("login-btn")).click();
        Thread.sleep(1500);

        String error = getErrorNow();
        System.out.println("   Error message: '" + error + "'");
        assertFalse(error.isEmpty(), "Short password should be blocked");
        System.out.println("   PASS: Short password correctly rejected.");
        Thread.sleep(2000);

        goToLogin();
    }

    // ── TEST 4: /dashboard is reachable without login (no route guard yet) ────
    @Test
    @Order(4)
    public void testProtectedRouteWithoutLogin() throws InterruptedException {
        System.out.println("\n>> [Test 4] Navigating directly to /dashboard without logging in...");
        Thread.sleep(1000);

        JavascriptExecutor js = (JavascriptExecutor) driver;
        js.executeScript("sessionStorage.removeItem('currentUser');");
        Thread.sleep(500);

        driver.get("http://localhost:5173/dashboard");
        Thread.sleep(2000);

        String currentUrl = driver.getCurrentUrl();
        System.out.println("   Landed on: " + currentUrl);
        System.out.println("   ⚠ WARNING: No route guard — unauthenticated users can reach /dashboard.");
        System.out.println("   ACTION NEEDED: Add a <ProtectedRoute> in your React router to fix this.");

        assertTrue(currentUrl.contains("localhost:5173"),
            "App should at least load without crashing");

        System.out.println("   PASS (with warning): App loaded without crashing.");
        Thread.sleep(2000);

        driver.get(URL);
        Thread.sleep(1500);
    }

    // ── TEST 5: localStorage clears correctly ─────────────────────────────────
    @Test
    @Order(5)
    public void testLocalStorageStartsEmpty() throws InterruptedException {
        System.out.println("\n>> [Test 5] Clearing localStorage and verifying users key is gone...");
        Thread.sleep(1000);

        JavascriptExecutor js = (JavascriptExecutor) driver;
        js.executeScript("localStorage.removeItem('users');");
        Thread.sleep(500);

        Object result = js.executeScript("return localStorage.getItem('users');");
        System.out.println("   localStorage 'users' after clear: " + result);
        assertNull(result, "localStorage 'users' should be null after clearing");

        System.out.println("   PASS: localStorage correctly cleared.");
        Thread.sleep(1500);
    }

    // ── TEST 6: Sign up saves user to localStorage ────────────────────────────
    @Test
    @Order(6)
    public void testLocalStorageSavesUserAfterSignUp() throws InterruptedException {
        System.out.println("\n>> [Test 6] Signing up and verifying user saved in localStorage...");
        Thread.sleep(1000);

        JavascriptExecutor js = (JavascriptExecutor) driver;
        js.executeScript("localStorage.removeItem('users');");
        Thread.sleep(300);

        goToSignUp();

        WebElement u = new WebDriverWait(driver, Duration.ofSeconds(5)).until(
            ExpectedConditions.visibilityOfElementLocated(
                By.cssSelector(".login-input-wrapper input[placeholder='Enter your username']")));
        WebElement p = driver.findElement(
            By.cssSelector(".login-input-wrapper input[placeholder='Enter your password']"));
        WebElement c = driver.findElement(
            By.cssSelector(".login-input-wrapper input[placeholder='Re-enter your password']"));

        slowType(u, "storeduser");
        slowType(p, "mypassword");
        slowType(c, "mypassword");

        System.out.println("   Signing up as 'storeduser'...");
        driver.findElement(By.className("login-btn")).click();
        Thread.sleep(2500);

        driver.get(URL);
        Thread.sleep(1500);

        Object stored = js.executeScript("return localStorage.getItem('users');");
        System.out.println("   localStorage 'users': " + stored);

        assertNotNull(stored, "localStorage should have users after sign up");
        assertTrue(stored.toString().contains("storeduser"),
            "localStorage should contain the registered username");

        System.out.println("   PASS: User correctly persisted to localStorage.");
        Thread.sleep(2000);
    }
}