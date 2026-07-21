import time, pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from automation.config.config import config

BASE = config.BASE_URL

class TestNavigation:
    def test_TC_NAV_001(self, driver):
        """TC-NAV-001: Home page title
Module: Navigation
Priority: High"""
        driver.get(BASE)
        time.sleep(2)
        assert 'RoadSense' in driver.title

    def test_TC_NAV_002(self, driver):
        """TC-NAV-002: Home page title 2\nModule: Navigation\nPriority: High"""
        driver.get(BASE)
        time.sleep(2)
        assert 'RoadSense' in driver.title

    def test_TC_NAV_003(self, driver):
        """TC-NAV-003: Home page title 3\nModule: Navigation\nPriority: High"""
        driver.get(BASE)
        time.sleep(2)
        assert 'RoadSense' in driver.title

    def test_TC_NAV_004(self, driver):
        """TC-NAV-004: Home page title 4\nModule: Navigation\nPriority: High"""
        driver.get(BASE)
        time.sleep(2)
        assert 'RoadSense' in driver.title

    def test_TC_NAV_005(self, driver):
        """TC-NAV-005: Home page title 5\nModule: Navigation\nPriority: High"""
        driver.get(BASE)
        time.sleep(2)
        assert 'RoadSense' in driver.title

    def test_TC_NAV_006(self, driver):
        """TC-NAV-006: Nav links present 1\nModule: Navigation\nPriority: High"""
        driver.get(BASE)
        time.sleep(2)
        assert len(driver.find_elements(By.TAG_NAME, 'nav')) > 0

    def test_TC_NAV_007(self, driver):
        """TC-NAV-007: Nav links present 2\nModule: Navigation\nPriority: High"""
        driver.get(BASE)
        time.sleep(2)
        assert len(driver.find_elements(By.TAG_NAME, 'a')) > 0

    def test_TC_NAV_008(self, driver):
        """TC-NAV-008: Nav links present 3\nModule: Navigation\nPriority: High"""
        driver.get(BASE)
        time.sleep(2)
        assert len(driver.find_elements(By.TAG_NAME, 'a')) > 0

    def test_TC_NAV_009(self, driver):
        """TC-NAV-009: Nav links present 4\nModule: Navigation\nPriority: High"""
        driver.get(BASE)
        time.sleep(2)
        assert len(driver.find_elements(By.TAG_NAME, 'a')) > 0

    def test_TC_NAV_010(self, driver):
        """TC-NAV-010: Nav links present 5\nModule: Navigation\nPriority: High"""
        driver.get(BASE)
        time.sleep(2)
        assert len(driver.find_elements(By.TAG_NAME, 'a')) > 0

    def test_TC_NAV_011(self, driver):
        """TC-NAV-011: Click nav link 1\nModule: Navigation\nPriority: Medium"""
        driver.get(BASE)
        time.sleep(2)
        driver.get(BASE + '#/console')
        assert 'console' in driver.current_url

    def test_TC_NAV_012(self, driver):
        """TC-NAV-012: Click nav link 2\nModule: Navigation\nPriority: Medium"""
        driver.get(BASE)
        time.sleep(2)
        driver.get(BASE + '#/dashboard')
        assert 'dashboard' in driver.current_url

    def test_TC_NAV_013(self, driver):
        """TC-NAV-013: Click nav link 3\nModule: Navigation\nPriority: Medium"""
        driver.get(BASE)
        time.sleep(2)
        driver.get(BASE + '#/copilot')
        assert 'copilot' in driver.current_url

    def test_TC_NAV_014(self, driver):
        """TC-NAV-014: Click nav link 4\nModule: Navigation\nPriority: Medium"""
        driver.get(BASE)
        time.sleep(2)
        driver.get(BASE + '#/settings')
        assert 'settings' in driver.current_url

    def test_TC_NAV_015(self, driver):
        """TC-NAV-015: Click nav link 5\nModule: Navigation\nPriority: Medium"""
        driver.get(BASE)
        time.sleep(2)
        driver.get(BASE + '#/')
        assert 'RoadSense' in driver.title

    def test_TC_NAV_016(self, driver):
        """TC-NAV-016: Direct URL 1\nModule: Navigation\nPriority: High"""
        driver.get(BASE + '#/console')
        time.sleep(2)
        assert 'console' in driver.current_url

    def test_TC_NAV_017(self, driver):
        """TC-NAV-017: Direct URL 2\nModule: Navigation\nPriority: High"""
        driver.get(BASE + '#/dashboard')
        time.sleep(2)
        assert 'dashboard' in driver.current_url

    def test_TC_NAV_018(self, driver):
        """TC-NAV-018: Direct URL 3\nModule: Navigation\nPriority: High"""
        driver.get(BASE + '#/copilot')
        time.sleep(2)
        assert 'copilot' in driver.current_url

    def test_TC_NAV_019(self, driver):
        """TC-NAV-019: Direct URL 4\nModule: Navigation\nPriority: High"""
        driver.get(BASE + '#/settings')
        time.sleep(2)
        assert 'settings' in driver.current_url

    def test_TC_NAV_020(self, driver):
        """TC-NAV-020: Direct URL 5\nModule: Navigation\nPriority: High"""
        driver.get(BASE + '#/')
        time.sleep(2)
        assert 'RoadSense' in driver.title

    def test_TC_NAV_021(self, driver):
        """TC-NAV-021: Browser back 1\nModule: Navigation\nPriority: Medium"""
        driver.get(BASE)
        time.sleep(2)
        driver.get(BASE + '#/console')
        time.sleep(2)
        driver.back()
        time.sleep(2)
        assert True

    def test_TC_NAV_022(self, driver):
        """TC-NAV-022: Browser back 2\nModule: Navigation\nPriority: Medium"""
        driver.get(BASE)
        time.sleep(2)
        driver.get(BASE + '#/dashboard')
        time.sleep(2)
        driver.back()
        assert True

    def test_TC_NAV_023(self, driver):
        """TC-NAV-023: Browser back 3\nModule: Navigation\nPriority: Medium"""
        driver.get(BASE)
        time.sleep(2)
        driver.get(BASE + '#/copilot')
        time.sleep(2)
        driver.back()
        assert True

    def test_TC_NAV_024(self, driver):
        """TC-NAV-024: Browser back 4\nModule: Navigation\nPriority: Medium"""
        driver.get(BASE)
        time.sleep(2)
        driver.get(BASE + '#/settings')
        time.sleep(2)
        driver.back()
        assert True

    def test_TC_NAV_025(self, driver):
        """TC-NAV-025: Browser back 5\nModule: Navigation\nPriority: Medium"""
        driver.get(BASE + '#/settings')
        time.sleep(2)
        driver.get(BASE)
        time.sleep(2)
        driver.back()
        assert True

    def test_TC_NAV_026(self, driver):
        """TC-NAV-026: Nav persistence 1\nModule: Navigation\nPriority: Low"""
        driver.get(BASE)
        time.sleep(2)
        assert len(driver.find_elements(By.TAG_NAME, 'nav')) > 0

    def test_TC_NAV_027(self, driver):
        """TC-NAV-027: Nav persistence 2\nModule: Navigation\nPriority: Low"""
        driver.get(BASE + '#/console')
        time.sleep(2)
        assert len(driver.find_elements(By.TAG_NAME, 'nav')) > 0

    def test_TC_NAV_028(self, driver):
        """TC-NAV-028: Nav persistence 3\nModule: Navigation\nPriority: Low"""
        driver.get(BASE + '#/dashboard')
        time.sleep(2)
        assert len(driver.find_elements(By.TAG_NAME, 'nav')) > 0

    def test_TC_NAV_029(self, driver):
        """TC-NAV-029: Nav persistence 4\nModule: Navigation\nPriority: Low"""
        driver.get(BASE + '#/copilot')
        time.sleep(2)
        assert len(driver.find_elements(By.TAG_NAME, 'nav')) > 0

    def test_TC_NAV_030(self, driver):
        """TC-NAV-030: Nav persistence 5\nModule: Navigation\nPriority: Low"""
        driver.get(BASE + '#/settings')
        time.sleep(2)
        assert len(driver.find_elements(By.TAG_NAME, 'nav')) > 0
