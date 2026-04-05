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
public class TestApplicationLoading {

  private static WebDriver driver;
  private static WebDriverWait wait;

  @BeforeAll
  public static void setUp() throws InterruptedException {
    WebDriverManager.chromedriver().setup();
    driver = new ChromeDriver();
    wait = new WebDriverWait(driver, Duration.ofSeconds(10));

    System.out.println(">> Opening Stock Engine at localhost:5173...");
    driver.get("http://localhost:5173");
    Thread.sleep(2000); // pause so you can see the page load
  }

  @AfterAll
  public static void tearDown() throws InterruptedException {
    Thread.sleep(2000); // pause before closing so you can see final state
    if (driver != null) {
      driver.quit();
    }
  }

  // ── TEST 1: Page title is not empty ──────────────────────────────────────
  @Test
  @Order(1)
  public void testPageTitleIsNotEmpty() throws InterruptedException {
    System.out.println(">> [Test 1] Checking page title...");
    Thread.sleep(1000);

    String title = driver.getTitle();
    System.out.println("   Page title found: " + title);

    assertNotNull(title, "Page title should not be null");
    assertFalse(title.isEmpty(), "Page title should not be empty");

    System.out.println("   PASS: Page title is '" + title + "'");
    Thread.sleep(1000);
  }

  // ── TEST 2: Login card is visible ─────────────────────────────────────────
  @Test
  @Order(2)
  public void testLoginCardIsVisible() throws InterruptedException {
    System.out.println(">> [Test 2] Checking login card visibility...");
    Thread.sleep(1000);

    WebElement loginCard = wait.until(
        ExpectedConditions.visibilityOfElementLocated(By.className("login-card")));

    assertTrue(loginCard.isDisplayed(), "Login card should be visible on load");
    System.out.println("   PASS: Login card is visible on screen.");
    Thread.sleep(1500);
  }

  // ── TEST 3: Left branding panel is visible ────────────────────────────────
  @Test
  @Order(3)
  public void testLeftBrandingPanelIsVisible() throws InterruptedException {
    System.out.println(">> [Test 3] Checking left branding panel...");
    Thread.sleep(1000);

    WebElement leftPanel = wait.until(
        ExpectedConditions.visibilityOfElementLocated(By.className("login-left")));

    assertTrue(leftPanel.isDisplayed(), "Left branding panel should be visible on load");
    System.out.println("   PASS: Left branding panel is visible.");
    Thread.sleep(1500);
  }

  // ── TEST 4: Brand name reads "Stock Engine" ───────────────────────────────
  @Test
  @Order(4)
  public void testBrandNameIsStockEngine() throws InterruptedException {
    System.out.println(">> [Test 4] Checking brand name text...");
    Thread.sleep(1000);

    WebElement brandName = wait.until(
        ExpectedConditions.visibilityOfElementLocated(By.className("brand-name")));

    System.out.println("   Brand name found: " + brandName.getText());
    assertEquals("Stock Engine", brandName.getText(), "Brand name should read 'Stock Engine'");
    System.out.println("   PASS: Brand name is 'Stock Engine'.");
    Thread.sleep(1500);
  }
}