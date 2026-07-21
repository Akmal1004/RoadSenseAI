"""
test_dashboard.py
=================
Selenium UI tests for the RoadSenseAI Dashboard page (route: #/dashboard).

Covers
------
* URL hash is correct
* Nav header visible
* At least one glass-panel stat card rendered
* "Distance" stat card present
* Safety-related label present
* Weather-related label present (Temperature / Wind / Humidity / Rain / Weather)
* Multiple stat cards in the grid
* No severe JS errors
"""

import time
import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


class TestDashboard:

    def _open(self, driver, base_url):
        driver.get(f"{base_url}/#/dashboard")
        WebDriverWait(driver, 15).until(
            lambda d: d.execute_script("return document.readyState") == "complete"
        )
        time.sleep(2)

    # ── URL ───────────────────────────────────────────────────────────────────
    def test_dashboard_url_hash(self, driver, base_url):
        """Navigating to #/dashboard sets the correct URL hash."""
        self._open(driver, base_url)
        assert "#/dashboard" in driver.current_url

    # ── layout ────────────────────────────────────────────────────────────────
    def test_nav_header_visible(self, driver, base_url):
        """nav.nav-header must stay visible on Dashboard."""
        self._open(driver, base_url)
        nav = WebDriverWait(driver, 10).until(
            EC.visibility_of_element_located((By.CSS_SELECTOR, "nav.nav-header"))
        )
        assert nav.is_displayed()

    def test_glass_panels_rendered(self, driver, base_url):
        """At least one .glass-panel card must be rendered on Dashboard."""
        self._open(driver, base_url)
        panels = driver.find_elements(By.CSS_SELECTOR, ".glass-panel")
        assert len(panels) >= 1, \
            f"Expected ≥1 glass-panel, found {len(panels)}."

    def test_multiple_stat_cards(self, driver, base_url):
        """Multiple glass-panel cards should be in the stats grid."""
        self._open(driver, base_url)
        panels = driver.find_elements(By.CSS_SELECTOR, ".glass-panel")
        assert len(panels) >= 2, \
            f"Expected ≥2 stat cards on Dashboard, found {len(panels)}."

    # ── content ───────────────────────────────────────────────────────────────
    def test_distance_label_present(self, driver, base_url):
        """'Distance' stat label must appear on Dashboard."""
        self._open(driver, base_url)
        el = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located(
                (By.XPATH, "//*[contains(text(),'Distance')]")
            )
        )
        assert el is not None

    def test_safety_label_present(self, driver, base_url):
        """A 'Safety' related label must appear on Dashboard."""
        self._open(driver, base_url)
        body_text = driver.find_element(By.TAG_NAME, "body").text
        assert any(kw in body_text for kw in ["Safety", "Safe", "SAFETY"]), \
            f"No safety label found. Body snippet: {body_text[:400]}"

    def test_weather_label_present(self, driver, base_url):
        """A weather-related label must appear on Dashboard."""
        self._open(driver, base_url)
        keywords = ["Weather", "Temperature", "Wind", "Humidity", "Rain", "Precipitation"]
        body_text = driver.find_element(By.TAG_NAME, "body").text
        assert any(kw in body_text for kw in keywords), \
            f"No weather label found. Body snippet: {body_text[:400]}"

    # ── JS errors ─────────────────────────────────────────────────────────────
    def test_no_severe_js_errors(self, driver, base_url):
        """No SEVERE JavaScript errors must appear on Dashboard load."""
        self._open(driver, base_url)
        time.sleep(1)
        logs = driver.get_log("browser")
        severe = [
            l for l in logs
            if l.get("level") == "SEVERE"
            and "favicon" not in l.get("message", "").lower()
        ]
        assert len(severe) == 0, f"Severe JS errors on Dashboard: {severe}"
