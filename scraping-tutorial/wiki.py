from selenium import webdriver
import random
import time
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options

# ---------------- SETUP ---------------- #
user_agents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/119.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/118.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/117.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 11_0) AppleWebKit/537.36 Chrome/116.0.0.0 Safari/537.36"
]

options = Options()
options.add_argument(f"user-agent={random.choice(user_agents)}")
options.add_argument("--disable-blink-features=AutomationControlled")
options.add_experimental_option("excludeSwitches", ["enable-automation"])
options.add_experimental_option("useAutomationExtension", False)

driver = webdriver.Chrome(options=options)
wait = WebDriverWait(driver, 30)

driver.execute_script(
    "Object.defineProperty(navigator, 'webdriver', {get: () => undefined})"
)

# ---------------- STEP 1: GOOGLE SEARCH ---------------- #
driver.get("https://www.google.com")

search_box = wait.until(EC.presence_of_element_located((By.NAME, "q")))
search_box.send_keys("Chess")
search_box.send_keys(Keys.RETURN)

# ---------------- STEP 2: OPEN WIKIPEDIA ---------------- #
wiki_result = wait.until(
    EC.element_to_be_clickable((By.XPATH, "//a[contains(@href, 'wikipedia')]"))
)
wiki_result.click()

# ---------------- STEP 3: EXTRACT DATA ---------------- #
title = wait.until(EC.presence_of_element_located(
    (By.ID, "firstHeading"))).text
print("\nPage Title:", title)

# First paragraph
paragraph = driver.find_element(By.CSS_SELECTOR, "p").text
print("\nFirst Paragraph:\n", paragraph[:300])

# ---------------- STEP 4: SCROLL LIKE HUMAN ---------------- #
for i in range(3):
    driver.execute_script("window.scrollBy(0, 500);")
    time.sleep(random.uniform(1, 2))

# ---------------- STEP 5: CLICK A LINK (Rules of Chess) ---------------- #
try:
    rules_link = driver.find_element(By.PARTIAL_LINK_TEXT, "rules")
    rules_link.click()
except:
    print("\nNo rules link found")

# ---------------- STEP 6: OPEN NEW TAB ---------------- #
driver.execute_script("window.open('https://www.youtube.com', '_blank');")

# Switch to new tab
driver.switch_to.window(driver.window_handles[1])

# ---------------- STEP 7: SEARCH YOUTUBE ---------------- #
search_box = wait.until(
    EC.presence_of_element_located((By.NAME, "search_query"))
)

search_box.send_keys("ChessBase India")
search_box.send_keys(Keys.RETURN)

# ---------------- STEP 8: EXTRACT VIDEO TITLES ---------------- #
videos = wait.until(
    EC.presence_of_all_elements_located((By.ID, "video-title"))
)

print("\nTop YouTube Results:")
for video in videos[:5]:
    print(video.get_attribute("title"))

# ---------------- STEP 9: SWITCH BACK ---------------- #
driver.switch_to.window(driver.window_handles[0])

print("\nBack to Wikipedia tab ✅")
