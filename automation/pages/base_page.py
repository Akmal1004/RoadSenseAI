import time
import logging
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from automation.config.config import config
from automation.utils.screenshot_utils import ScreenshotUtils

logger = logging.getLogger(__name__)

class BasePage:
    def __init__(self, driver: webdriver.Chrome):
        self.driver = driver
        self.wait = WebDriverWait(driver, config.EXPLICIT_WAIT)
        self.screenshot = ScreenshotUtils(driver)
    
    def navigate_to(self, url: str):
        self.driver.get(url)
        time.sleep(1.5)
    
    def wait_for_element(self, by, value, timeout=None):
        t = timeout or config.EXPLICIT_WAIT
        return WebDriverWait(self.driver, t).until(EC.visibility_of_element_located((by, value)))
    
    def wait_for_clickable(self, by, value, timeout=None):
        t = timeout or config.EXPLICIT_WAIT
        return WebDriverWait(self.driver, t).until(EC.element_to_be_clickable((by, value)))
    
    def is_element_present(self, by, value, timeout=5) -> bool:
        try:
            WebDriverWait(self.driver, timeout).until(EC.presence_of_element_located((by, value)))
            return True
        except TimeoutException:
            return False
    
    def get_text(self, by, value) -> str:
        try:
            return self.wait_for_element(by, value).text
        except Exception:
            return ''
    
    def click(self, by, value):
        self.wait_for_clickable(by, value).click()
    
    def type_text(self, by, value, text: str):
        el = self.wait_for_element(by, value)
        el.clear()
        el.send_keys(text)
    
    def get_title(self) -> str:
        return self.driver.title
    
    def get_url(self) -> str:
        return self.driver.current_url
    
    def get_page_source(self) -> str:
        return self.driver.page_source
    
    def execute_script(self, script: str, *args):
        return self.driver.execute_script(script, *args)
    
    def get_browser_logs(self) -> list:
        try:
            return self.driver.get_log('browser')
        except Exception:
            return []
    
    def scroll_to_bottom(self):
        self.execute_script('window.scrollTo(0, document.body.scrollHeight)')
        time.sleep(0.5)
    
    def scroll_to_top(self):
        self.execute_script('window.scrollTo(0, 0)')
        time.sleep(0.5)
    
    def get_element_css_value(self, by, value, prop: str) -> str:
        try:
            return self.wait_for_element(by, value).value_of_css_property(prop)
        except Exception:
            return ''
    
    def is_element_visible(self, by, value, timeout=5) -> bool:
        try:
            WebDriverWait(self.driver, timeout).until(EC.visibility_of_element_located((by, value)))
            return True
        except TimeoutException:
            return False
    
    def count_elements(self, by, value) -> int:
        return len(self.driver.find_elements(by, value))
    
    def get_attribute(self, by, value, attr: str) -> str:
        try:
            return self.wait_for_element(by, value).get_attribute(attr) or ''
        except Exception:
            return ''
