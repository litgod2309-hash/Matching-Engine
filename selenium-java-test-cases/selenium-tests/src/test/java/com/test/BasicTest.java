package com.test;

import org.junit.jupiter.api.Test;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;

import io.github.bonigarcia.wdm.WebDriverManager;

public class BasicTest {

  @Test
  public void openFrontend() throws InterruptedException {

    // Setup Chrome driver automatically
    WebDriverManager.chromedriver().setup();

    WebDriver driver = new ChromeDriver();

    // Open your frontend app
    driver.get("http://localhost:5173");

    // Wait 5 seconds to see it
    Thread.sleep(5000);

    // Close browser
    driver.quit();
  }
}