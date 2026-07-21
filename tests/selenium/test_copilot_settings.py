"""
test_copilot_settings.py
========================
Selenium UI tests for:
  - AI Co-Pilot page  (route: #/copilot)
  - Profile Settings  (route: #/settings)

Co-Pilot covers
---------------
* URL hash correct
* Nav header visible
* Chat textarea or text input present
* Send/submit button present
* AI / Co-Pilot branding present
* Chat input accepts typed text
* No severe JS errors

Settings covers
---------------
* URL hash correct
* Nav header visible
* Page has meaningful content (not blank)
* Settings/Profile keyword present
* At least one glass-panel rendered
* No severe JS errors
"""

import time
import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


# ─── AI Co-Pilot ────────────────────────────────────────────────────────────

class TestCoPilot:

    def _open(self, driver, base_url):
        driver.get(f"{base_url}/#/copilot")
        WebDriverWait(driver, 15).until(
            lambda d: d.execute_script("return document.readyState") == "complete"
        )
        time.sleep(2)

    def _chat_input(self, driver):
        """Return the first available chat input element (textarea or text input)."""
        try:
            return WebDriverWait(driver, 8).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "textarea"))
            )
        except Exception:
            return WebDriverWait(driver, 5).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='text']"))
            )

    def test_copilot_url_hash(self, driver, base_url):
        """#/copilot sets the URL hash correctly."""
        self._open(driver, base_url)
        assert "#/copilot" in driver.current_url

    def test_copilot_nav_visible(self, driver, base_url):
        """nav.nav-header must be visible on Co-Pilot page."""
        self._open(driver, base_url)
        nav = WebDriverWait(driver, 10).until(
            EC.visibility_of_element_located((By.CSS_SELECTOR, "nav.nav-header"))
        )
        assert nav.is_displayed()

    def test_chat_input_present(self, driver, base_url):
        """A textarea or text input for chat messages must be present."""
        self._open(driver, base_url)
        inp = self._chat_input(driver)
        assert inp is not None, "No chat input found on Co-Pilot page."

    def test_send_button_present(self, driver, base_url):
        """At least one button (Send / Submit) must be present."""
        self._open(driver, base_url)
        buttons = driver.find_elements(By.CSS_SELECTOR, "button")
        assert len(buttons) >= 1, "No buttons found on Co-Pilot page."

    def test_copilot_branding_present(self, driver, base_url):
        """'Co-Pilot', 'Copilot', or 'AI' branding must appear on the page."""
        self._open(driver, base_url)
        body_text = driver.find_element(By.TAG_NAME, "body").text
        assert any(kw in body_text for kw in ["Co-Pilot", "Copilot", "CoPilot", "AI"]), \
            f"No Co-Pilot branding found. Body snippet: {body_text[:400]}"

    def test_chat_input_accepts_text(self, driver, base_url):
        """Typing in the chat input reflects the typed message."""
        self._open(driver, base_url)
        inp = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable(self._chat_input(driver))
        )
        inp.click()
        inp.send_keys("What is the safest route to Mysore?")
        time.sleep(0.5)
        val = inp.get_attribute("value")
        assert len(val) > 0, \
            "Chat input did not capture any typed text."

    def test_no_severe_js_errors(self, driver, base_url):
        """No SEVERE JS errors on Co-Pilot page."""
        self._open(driver, base_url)
        time.sleep(1)
        logs = driver.get_log("browser")
        severe = [
            l for l in logs
            if l.get("level") == "SEVERE"
            and "favicon" not in l.get("message", "").lower()
        ]
        assert len(severe) == 0, f"Severe JS errors on Co-Pilot: {severe}"


# ─── Profile Settings ────────────────────────────────────────────────────────

class TestSettings:

    def _open(self, driver, base_url):
        driver.get(f"{base_url}/#/settings")
        WebDriverWait(driver, 15).until(
            lambda d: d.execute_script("return document.readyState") == "complete"
        )
        time.sleep(2)

    def test_settings_url_hash(self, driver, base_url):
        """#/settings sets the URL hash correctly."""
        self._open(driver, base_url)
        assert "#/settings" in driver.current_url

    def test_settings_nav_visible(self, driver, base_url):
        """nav.nav-header must be visible on Settings page."""
        self._open(driver, base_url)
        nav = WebDriverWait(driver, 10).until(
            EC.visibility_of_element_located((By.CSS_SELECTOR, "nav.nav-header"))
        )
        assert nav.is_displayed()

    def test_settings_page_not_blank(self, driver, base_url):
        """Settings page must render meaningful content."""
        self._open(driver, base_url)
        body_text = driver.find_element(By.TAG_NAME, "body").text.strip()
        assert len(body_text) > 50, \
            f"Settings page appears blank. Text length: {len(body_text)}"

    def test_settings_keyword_present(self, driver, base_url):
        """A settings/profile keyword must appear on the Settings page."""
        self._open(driver, base_url)
        body_text = driver.find_element(By.TAG_NAME, "body").text
        keywords = ["Settings", "Profile", "Preferences", "Route", "Theme", "Driver"]
        assert any(kw in body_text for kw in keywords), \
            f"No settings keyword found. Snippet: {body_text[:400]}"

    def test_settings_glass_panel(self, driver, base_url):
        """At least one glass-panel must render on the Settings page."""
        self._open(driver, base_url)
        panels = driver.find_elements(By.CSS_SELECTOR, ".glass-panel")
        assert len(panels) >= 1, \
            f"Expected ≥1 glass-panel on Settings, found {len(panels)}."

    def test_no_severe_js_errors(self, driver, base_url):
        """No SEVERE JS errors on Settings page."""
        self._open(driver, base_url)
        time.sleep(1)
        logs = driver.get_log("browser")
        severe = [
            l for l in logs
            if l.get("level") == "SEVERE"
            and "favicon" not in l.get("message", "").lower()
        ]
        assert len(severe) == 0, f"Severe JS errors on Settings: {severe}"
