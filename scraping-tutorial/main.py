from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

driver = webdriver.Chrome()
wait = WebDriverWait(driver, 10)

# AMAZON
driver.get("https://www.amazon.in")

search_box = wait.until(EC.presence_of_element_located(
    (By.ID, "twotabsearchtextbox")))
search_box.send_keys("laptop")
driver.find_element(By.ID, "nav-search-submit-button").click()

products = wait.until(EC.presence_of_all_elements_located(
    (By.CSS_SELECTOR, "h2 span")))

print("Amazon Results:")
for p in products[:5]:
    print(p.text)

# YOUTUBE
driver.get("https://www.youtube.com")

search_box = wait.until(
    EC.presence_of_element_located((By.NAME, "search_query")))
search_box.send_keys("machine learning")
driver.find_element(By.ID, "search-icon-legacy").click()

videos = wait.until(
    EC.presence_of_all_elements_located((By.ID, "video-title")))

print("\nFiltered YouTube Videos:")
for video in videos:
    title = video.get_attribute("title")
    if title and "tutorial" in title.lower():
        print(title)
