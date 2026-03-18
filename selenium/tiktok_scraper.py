import time, os
from selenium import webdriver
from selenium_stealth import stealth
from webdriver_manager.chrome import ChromeDriverManager

from selenium.scraper_helper import *

SCROLL_PAUSE_TIME = 3
NUM_VIDEOS_MAX = 5

options = webdriver.ChromeOptions()
options.add_argument("start-maximized")

options.add_experimental_option("excludeSwitches", ["enable-automation"])
options.add_experimental_option('useAutomationExtension', False)
driver = webdriver.Chrome(ChromeDriverManager().install(), options=options)

stealth(driver,
        languages=["en-US", "en"],
        vendor="Google Inc.",
        platform="Win32",
        webgl_vendor="Intel Inc.",
        renderer="Intel Iris OpenGL Engine",
        fix_hairline=True,
        )

driver.maximize_window()

driver.get('https://www.tiktok.com')

time.sleep(50)

video_site_list = [get_video_string(driver)]

# Get scroll height
last_height = driver.execute_script("return document.body.scrollHeight")

while True:
    # Scroll down to bottom
    driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")

    # Wait to load page
    time.sleep(SCROLL_PAUSE_TIME)

    # Calculate new scroll height and compare with last scroll height
    new_height = driver.execute_script("return document.body.scrollHeight")
    if new_height == last_height:
        break
    last_height = new_height

    video_site_list.append(get_video_string(driver))
    if len(video_site_list) == NUM_VIDEOS_MAX:
        break

for site in video_site_list:
    driver.get(site)
    print(site)
    print("=============================")
    print(get_embed_block(driver))

driver.close()
