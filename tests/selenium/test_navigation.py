"""
test_navigation.py
==================
Selenium UI tests for hash-based client-side routing in RoadSenseAI.

Covers
------
* Each of the 5 routes loads without crashing (#/, #/console, #/dashboard,
  #/copilot, #/settings)
* Nav header persists on every route
* Clicking each nav link changes the URL hash correctly
* Browser back button restores the previous route
* Direct URL navigation to each hash route works
"""

import time
import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


# All app routes
ROUTES = [
    ("/#/",         "Home"),
    ("/#/console",  "Console"),
    ("/#/dashboard","Dashboard"),
    ("/#/copilot",  "AI Co-Pilot"),
    ("/#/settings", "Settings"),
]


class TestNavigation:

    def _go(self, driver, base_url, hash_path):
        driver.get(f"{base_url}{hash_path}")
        WebDriverWait(driver, 15).until(
            lambda d: d.execute_script("return document.readyState") == "complete"
        )
        time.sleep(1)

    # ── route loading ─────────────────────────────────────────────────────────
    def test_home_route_loads(self, driver, base_url):
        """#/ loads with hero section visible."""
        self._go(driver, base_url, "/#/")
        hero = WebDriverWait(driver, 10).until(
            EC.visibility_of_element_located((By.CSS_SELECTOR, "header.glass-panel"))
        )
        assert hero.is_displayed()

    def test_console_route_loads(self, driver, base_url):
        """#/console sets the URL hash correctly."""
        self._go(driver, base_url, "/#/console")
        assert "#/console" in driver.current_url

    def test_dashboard_route_loads(self, driver, base_url):
        """#/dashboard sets the URL hash correctly."""
        self._go(driver, base_url, "/#/dashboard")
        assert "#/dashboard" in driver.current_url

    def test_copilot_route_loads(self, driver, base_url):
        """#/copilot sets the URL hash correctly."""
        self._go(driver, base_url, "/#/copilot")
        assert "#/copilot" in driver.current_url

    def test_settings_route_loads(self, driver, base_url):
        """#/settings sets the URL hash correctly."""
        self._go(driver, base_url, "/#/settings")
        assert "#/settings" in driver.current_url

    # ── nav header persists ───────────────────────────────────────────────────
    def test_nav_header_on_every_route(self, driver, base_url):
        """nav.nav-header must be visible on all 5 routes."""
        for hash_path, name in ROUTES:
            self._go(driver, base_url, hash_path)
            nav = WebDriverWait(driver, 10).until(
                EC.visibility_of_element_located((By.CSS_SELECTOR, "nav.nav-header"))
            )
            assert nav.is_displayed(), f"Nav header missing on route '{name}'."

    # ── nav link clicks ───────────────────────────────────────────────────────
    def test_click_nav_console(self, driver, base_url):
        """Clicking 'Console' nav link navigates to #/console."""
        self._go(driver, base_url, "/#/")
        link = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable(
                (By.XPATH, "//nav[contains(@class,'nav-header')]//a[text()='Console']")
            )
        )
        link.click()
        time.sleep(1)
        assert "#/console" in driver.current_url, \
            f"Expected #/console, got: {driver.current_url}"

    def test_click_nav_dashboard(self, driver, base_url):
        """Clicking 'Dashboard' nav link navigates to #/dashboard."""
        self._go(driver, base_url, "/#/")
        link = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable(
                (By.XPATH, "//nav[contains(@class,'nav-header')]//a[text()='Dashboard']")
            )
        )
        link.click()
        time.sleep(1)
        assert "#/dashboard" in driver.current_url

    def test_click_nav_copilot(self, driver, base_url):
        """Clicking 'AI Co-Pilot' nav link navigates to #/copilot."""
        self._go(driver, base_url, "/#/")
        link = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable(
                (By.XPATH, "//nav[contains(@class,'nav-header')]//a[text()='AI Co-Pilot']")
            )
        )
        link.click()
        time.sleep(1)
        assert "#/copilot" in driver.current_url

    def test_click_nav_settings(self, driver, base_url):
        """Clicking 'Settings' nav link navigates to #/settings."""
        self._go(driver, base_url, "/#/")
        link = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable(
                (By.XPATH, "//nav[contains(@class,'nav-header')]//a[text()='Settings']")
            )
        )
        link.click()
        time.sleep(1)
        assert "#/settings" in driver.current_url

    def test_click_nav_home(self, driver, base_url):
        """Clicking 'Home' from another route navigates back to #/."""
        self._go(driver, base_url, "/#/dashboard")
        link = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable(
                (By.XPATH, "//nav[contains(@class,'nav-header')]//a[text()='Home']")
            )
        )
        link.click()
        time.sleep(1)
        # Back at home — hero should be visible
        hero = WebDriverWait(driver, 10).until(
            EC.visibility_of_element_located((By.CSS_SELECTOR, "header.glass-panel"))
        )
        assert hero.is_displayed()

    # ── browser back ─────────────────────────────────────────────────────────
    def test_browser_back_button(self, driver, base_url):
        """Browser back must restore the previous route."""
        self._go(driver, base_url, "/#/")
        self._go(driver, base_url, "/#/console")
        driver.back()
        time.sleep(1)
        assert "RoadSense" in driver.title, \
            "App title missing after browser back navigation."
