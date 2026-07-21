import os
import time
import logging
from datetime import datetime
from selenium import webdriver
from automation.config.config import config

logger = logging.getLogger(__name__)

class ScreenshotUtils:
    def __init__(self, driver: webdriver.Chrome):
        self.driver = driver
        os.makedirs(config.SCREENSHOT_DIR, exist_ok=True)
    
    def capture(self, name: str) -> str:
        ts = datetime.now().strftime('%Y%m%d_%H%M%S')
        safe_name = name.replace(' ', '_').replace('/', '_')[:50]
        path = os.path.join(config.SCREENSHOT_DIR, f"{safe_name}_{ts}.png")
        try:
            self.driver.save_screenshot(path)
            logger.info(f"Screenshot saved: {path}")
            return path
        except Exception as e:
            logger.error(f"Screenshot failed: {e}")
            return ''
    
    def capture_on_failure(self, test_id: str) -> str:
        return self.capture(f"FAIL_{test_id}")
    
    def capture_element(self, element, name: str) -> str:
        ts = datetime.now().strftime('%Y%m%d_%H%M%S')
        path = os.path.join(config.SCREENSHOT_DIR, f"{name}_{ts}.png")
        try:
            element.screenshot(path)
            return path
        except Exception as e:
            return self.capture(name)
