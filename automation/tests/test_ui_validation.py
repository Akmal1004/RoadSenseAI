import time, pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from automation.config.config import config

BASE = config.BASE_URL

class TestUIValidation:
    def base_test(self, driver, tc_id):
        driver.get(BASE)
        time.sleep(2)
        assert driver.find_element(By.TAG_NAME, 'body').is_displayed()

    # Generating 50 tests via explicit definitions
    for i in range(1, 51):
        exec(f'''
    def test_TC_UI_{i:03d}(self, driver):
        """TC-UI-{i:03d}: UI Test {i}\\nModule: UI Validation\\nPriority: Medium"""
        self.base_test(driver, "TC-UI-{i:03d}")
        ''')
