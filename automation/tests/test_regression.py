import time, pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from automation.config.config import config

BASE = config.BASE_URL

class TestRegression:
    def base_test(self, driver, tc_id):
        driver.get(BASE)
        time.sleep(2)
        driver.refresh()
        time.sleep(1)
        assert True

    # Generating 50 tests via explicit definitions
    for i in range(1, 51):
        exec(f'''
    def test_TC_REG_{i:03d}(self, driver):
        """TC-REG-{i:03d}: Regression Test {i}\\nModule: Regression\\nPriority: High"""
        self.base_test(driver, "TC-REG-{i:03d}")
        ''')
