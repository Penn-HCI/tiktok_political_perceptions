from selenium.webdriver.common.by import By
from selenium.webdriver.common.action_chains import ActionChains


def get_video_string(driver):
    format_video_site = "https://www.tiktok.com/@{author}/video/{id}"

    # Find the video that is currently playing
    video_tag = driver.find_element(By.XPATH, "//video")

    # Go up by 1 parent to find video id
    video_id_tag = video_tag.find_element(By.XPATH, './parent::*')
    id_str = video_id_tag.get_attribute("id").split('-')[2]  # The id is of format: xgwrapper-0-7167856489829272838

    # Go up by 8 parents to find recommend list container which has the author
    parents_str = './parent::*/parent::*/parent::*/parent::*/parent::*/parent::*/parent::*/parent::*'
    recommend_list_tag = video_tag.find_element(By.XPATH, parents_str)
    author_tag = recommend_list_tag.find_element(By.XPATH, ".//h3[@data-e2e='video-author-uniqueid']")

    return format_video_site.format(author=author_tag.text, id=id_str)


def get_embed_block(driver):
    a = ActionChains(driver)

    # Find the share icon and hover over it
    share_elem = driver.find_element(By.XPATH, "//span[@data-e2e='share-icon']")
    a.move_to_element(share_elem).perform()

    # Click the embed link to open the text box
    embed_link = driver.find_element_by_link_text("Embed")
    a.move_to_element(embed_link).click().perform()

    # Find the embed text block and return
    text_block = driver.find_element(By.XPATH, "//textarea")
    return text_block.text
