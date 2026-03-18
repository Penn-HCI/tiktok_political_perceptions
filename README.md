# TikTok Political Video Annotation Extension (Tiktok-main)

This Chrome extension enables researchers to collect user annotations on the political content of TikTok videos. It injects a lightweight survey onto each video as users scroll, capturing structured responses for downstream analysis.

## What It Does

- Prompts users to enter a participant ID.
- Displays onboarding instructions and a FAQ modal.
- Injects a survey UI overlay onto every video on TikTok’s `tiktok.com` homepage feed.
- Observes new videos added to the page and tracks which videos users see via `MutationObserver`
- Collects detailed video metadata (video ID, author, timestamp, etc.)
- Sends video metadata and survey responses to a configured API endpoint.

## Installation for Local Testing

1. Clone or download this repository.
2. Update the `baseUrl` variable in `content.js`:
    const baseUrl = "https://your-api-address-here"; // Replace with your server
3. Open Chrome and navigate to `chrome://extensions/`.
4. Enable **Developer mode** (top right).
5. Click **Load unpacked** and select this project folder.
6. Navigate to [tiktok.com](https://www.tiktok.com) and activate the extension.

### File Structure
- manifest.json: extension metadata and permissions
- popup.html: login popup shown on launch
- popup.js: handles login, triggers main content script
- content.js: injected into TikTok, contains main logic
- styles.css: injected styles for survey, modals, etc.

# TikTok Video Scraper (selenium)

This script uses `selenium` with stealth features to scrape video metadata and embed blocks from TikTok's `tiktok.com` homepage feed. It's useful for researchers who want to collect and analyze TikTok videos for their studies.

# What It Does
- Lauches a stealth-enabled Chrome browser.
- Scrolls through TikTok's homepage feed.
- Identifies and collects:
    - Video URLs
    - Author usernames
    - Embed codes via the share menu
- Supports a configurable number of videos to scrape.

## File Structure
- scraper.py: Main scraping script.
- scraper_helper.py: Helper functions used by scraper.py.

## How to Run
python scraper.py
