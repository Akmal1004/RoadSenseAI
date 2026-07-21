import os
import logging
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from automation.config.config import config

logger = logging.getLogger(__name__)

class DriverFactory:
    @staticmethod
    def create_driver(headless: bool = None) -> webdriver.Chrome:
        """Create and configure headless Chrome WebDriver."""
        opts = Options()
        use_headless = headless if headless is not None else config.HEADLESS
        
        if use_headless:
            opts.add_argument('--headless=new')
        
        opts.add_argument('--no-sandbox')
        opts.add_argument('--disable-dev-shm-usage')
        opts.add_argument('--disable-gpu')
        opts.add_argument(f'--window-size={config.WINDOW_WIDTH},{config.WINDOW_HEIGHT}')
        opts.add_argument('--disable-extensions')
        opts.add_argument('--disable-infobars')
        opts.add_argument('--log-level=3')
        opts.add_argument('--remote-debugging-port=9222')
        opts.add_experimental_option('excludeSwitches', ['enable-logging'])
        
        driver = webdriver.Chrome(options=opts)  # Selenium 4.6+ auto-manages driver
        driver.set_page_load_timeout(config.PAGE_LOAD_TIMEOUT)
        driver.implicitly_wait(config.IMPLICIT_WAIT)
        driver.set_window_size(config.WINDOW_WIDTH, config.WINDOW_HEIGHT)
        
        logger.info(f"Chrome WebDriver created (headless={use_headless})")
        return driver
    
    @staticmethod  
    def create_mobile_driver(width: int = 390, height: int = 844) -> webdriver.Chrome:
        """Create mobile-viewport Chrome driver."""
        opts = Options()
        opts.add_argument('--headless=new')
        opts.add_argument('--no-sandbox')
        opts.add_argument('--disable-dev-shm-usage')
        opts.add_argument(f'--window-size={width},{height}')
        opts.add_experimental_option('mobileEmulation', {
            'deviceMetrics': {'width': width, 'height': height, 'pixelRatio': 3.0},
            'userAgent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15'
        })
        driver = webdriver.Chrome(options=opts)
        driver.set_page_load_timeout(30)
        return driver
