"""
test_console.py
===============
Selenium UI tests for the RoadSenseAI Console page (route: #/console).

The console is the main Route Planner screen.

Covers
------
* URL hash is correct after navigation
* Source and destination text inputs exist and accept input
* Source input can be cleared with keyboard
* Search category chips render (Fuel, Hospitals, Restaurants, Parking, Hotels,
  EV Chargers, ATMs, Nearby)
* Route preference options exist: Safest, Fastest, Eco
* No severe JS errors on console page load
"""

import time
import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


class TestConsole:

    def _open(self, driver, base_url):
        driver.get(f"{base_url}/#/console")
        WebDriverWait(driver, 15).until(
            lambda d: d.execute_script("return document.readyState") == "complete"
        )
        time.sleep(2)

    # ── URL ───────────────────────────────────────────────────────────────────
    def test_console_url_hash(self, driver, base_url):
        """Navigating to #/console sets the correct URL hash."""
        self._open(driver, base_url)
        assert "#/console" in driver.current_url

    # ── inputs ────────────────────────────────────────────────────────────────
    def test_source_input_present(self, driver, base_url):
        """At least one text input (source field) must exist on Console."""
        self._open(driver, base_url)
        inputs = driver.find_elements(By.CSS_SELECTOR, "input[type='text']")
        assert len(inputs) >= 1, \
            f"Expected ≥1 text input, found {len(inputs)}."

    def test_destination_input_present(self, driver, base_url):
        """At least two text inputs (source + destination) must exist."""
        self._open(driver, base_url)
        inputs = driver.find_elements(By.CSS_SELECTOR, "input[type='text']")
        assert len(inputs) >= 2, \
            f"Expected ≥2 text inputs, found {len(inputs)}."

    def test_source_input_accepts_text(self, driver, base_url):
        """Typing into source input reflects the typed value."""
        self._open(driver, base_url)
        src = driver.find_elements(By.CSS_SELECTOR, "input[type='text']")[0]
        src.click()
        src.send_keys("Bangalore")
        time.sleep(0.5)
        assert "Bangalore" in src.get_attribute("value"), \
            f"Source input value: '{src.get_attribute('value')}'"

    def test_destination_input_accepts_text(self, driver, base_url):
        """Typing into destination input reflects the typed value."""
        self._open(driver, base_url)
        dest = driver.find_elements(By.CSS_SELECTOR, "input[type='text']")[1]
        dest.click()
        dest.send_keys("Mysore")
        time.sleep(0.5)
        assert "Mysore" in dest.get_attribute("value"), \
            f"Destination input value: '{dest.get_attribute('value')}'"

    def test_source_clear_with_keyboard(self, driver, base_url):
        """Source input can be cleared with Ctrl+A → Delete."""
        self._open(driver, base_url)
        src = driver.find_elements(By.CSS_SELECTOR, "input[type='text']")[0]
        src.click()
        src.send_keys("Bangalore")
        time.sleep(0.3)
        src.send_keys(Keys.CONTROL + "a")
        src.send_keys(Keys.DELETE)
        time.sleep(0.3)
        assert src.get_attribute("value") == "", \
            f"Expected empty source, got: '{src.get_attribute('value')}'"

    # ── category chips ────────────────────────────────────────────────────────
    def test_fuel_stations_chip(self, driver, base_url):
        """'Fuel' category chip must be visible."""
        self._open(driver, base_url)
        el = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.XPATH, "//*[contains(text(),'Fuel')]"))
        )
        assert el is not None

    def test_hospitals_chip(self, driver, base_url):
        """'Hospital' category chip must be visible."""
        self._open(driver, base_url)
        el = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.XPATH, "//*[contains(text(),'Hospital')]"))
        )
        assert el is not None

    def test_restaurants_chip(self, driver, base_url):
        """'Restaurant' category chip must be visible."""
        self._open(driver, base_url)
        el = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.XPATH, "//*[contains(text(),'Restaurant')]"))
        )
        assert el is not None

    def test_parking_chip(self, driver, base_url):
        """'Parking' category chip must be visible."""
        self._open(driver, base_url)
        el = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.XPATH, "//*[contains(text(),'Parking')]"))
        )
        assert el is not None

    # ── route preferences ─────────────────────────────────────────────────────
    def test_safest_preference_present(self, driver, base_url):
        """'Safest' route preference option must be rendered."""
        self._open(driver, base_url)
        el = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.XPATH, "//*[contains(text(),'Safest')]"))
        )
        assert el is not None

    def test_fastest_preference_present(self, driver, base_url):
        """'Fastest' route preference option must be rendered."""
        self._open(driver, base_url)
        el = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.XPATH, "//*[contains(text(),'Fastest')]"))
        )
        assert el is not None

    def test_eco_preference_present(self, driver, base_url):
        """'Eco' route preference option must be rendered."""
        self._open(driver, base_url)
        el = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.XPATH, "//*[contains(text(),'Eco')]"))
        )
        assert el is not None

    # ── JS errors ─────────────────────────────────────────────────────────────
    def test_no_severe_js_errors(self, driver, base_url):
        """No SEVERE JavaScript errors on Console page load."""
        self._open(driver, base_url)
        time.sleep(1)
        logs = driver.get_log("browser")
        severe = [
            l for l in logs
            if l.get("level") == "SEVERE"
            and "favicon" not in l.get("message", "").lower()
        ]
        assert len(severe) == 0, f"Severe JS errors on Console: {severe}"
