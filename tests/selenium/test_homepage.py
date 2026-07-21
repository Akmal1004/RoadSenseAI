"""
test_homepage.py
================
Selenium UI tests for the RoadSenseAI landing page (route: #/).

Covers
------
* Page title contains "RoadSense"
* Navigation header (.nav-header) is rendered
* Brand name "RoadSense" appears in the nav
* All 5 nav links present: Home, Console, Dashboard, AI Co-Pilot, Settings
* "Launch App" CTA button is clickable and navigates to #/console
* "No Active Trip" status badge is visible by default
* Hero section (header.glass-panel) renders
* Footer copyright text contains "RoadSense"
* No severe JavaScript errors on load
* Page is NOT blank (body has meaningful text content)
"""

import time
import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


class TestHomePage:

    # ── helpers ──────────────────────────────────────────────────────────────
    def _load(self, driver, base_url, path="#/"):
        driver.get(f"{base_url}/{path}")
        WebDriverWait(driver, 15).until(
            lambda d: d.execute_script("return document.readyState") == "complete"
        )
        time.sleep(1)

    # ── tests ─────────────────────────────────────────────────────────────────
    def test_page_title_contains_roadsense(self, driver, base_url):
        """Browser tab title must contain 'RoadSense'."""
        self._load(driver, base_url)
        assert "RoadSense" in driver.title, \
            f"Expected 'RoadSense' in title, got: '{driver.title}'"

    def test_nav_header_rendered(self, driver, base_url):
        """Top navigation bar (nav.nav-header) must be visible."""
        self._load(driver, base_url)
        nav = WebDriverWait(driver, 10).until(
            EC.visibility_of_element_located((By.CSS_SELECTOR, "nav.nav-header"))
        )
        assert nav.is_displayed(), "nav.nav-header is not visible."

    def test_brand_name_in_nav(self, driver, base_url):
        """'RoadSense' brand text must appear inside the nav header."""
        self._load(driver, base_url)
        nav = driver.find_element(By.CSS_SELECTOR, "nav.nav-header")
        assert "RoadSense" in nav.text, \
            f"'RoadSense' not found in nav text: {nav.text[:200]}"

    def test_all_nav_links_present(self, driver, base_url):
        """All 5 nav links must be present in the header."""
        self._load(driver, base_url)
        expected = ["Home", "Console", "Dashboard", "AI Co-Pilot", "Settings"]
        nav_text = driver.find_element(By.CSS_SELECTOR, "nav.nav-header").text
        for link in expected:
            assert link in nav_text, f"Nav link '{link}' not found."

    def test_launch_app_button_visible(self, driver, base_url):
        """'Launch App' CTA button must be visible in the header."""
        self._load(driver, base_url)
        btn = WebDriverWait(driver, 10).until(
            EC.visibility_of_element_located(
                (By.XPATH, "//a[contains(text(),'Launch App')]")
            )
        )
        assert btn.is_displayed(), "'Launch App' button not visible."

    def test_launch_app_navigates_to_console(self, driver, base_url):
        """Clicking 'Launch App' must set the URL hash to #/console."""
        self._load(driver, base_url)
        btn = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable(
                (By.XPATH, "//a[contains(text(),'Launch App')]")
            )
        )
        btn.click()
        time.sleep(1.5)
        assert "#/console" in driver.current_url, \
            f"Expected #/console in URL, got: {driver.current_url}"

    def test_no_active_trip_badge(self, driver, base_url):
        """'No Active Trip' badge renders when no route is planned."""
        self._load(driver, base_url)
        badge = WebDriverWait(driver, 10).until(
            EC.visibility_of_element_located(
                (By.XPATH, "//*[contains(text(),'No Active Trip')]")
            )
        )
        assert badge.is_displayed(), "'No Active Trip' badge not visible."

    def test_hero_section_renders(self, driver, base_url):
        """The main hero header (header.glass-panel) must be visible."""
        self._load(driver, base_url)
        hero = WebDriverWait(driver, 10).until(
            EC.visibility_of_element_located((By.CSS_SELECTOR, "header.glass-panel"))
        )
        assert hero.is_displayed(), "Hero section not visible."

    def test_footer_copyright_present(self, driver, base_url):
        """Footer must contain 'RoadSense' copyright text."""
        self._load(driver, base_url)
        footer = WebDriverWait(driver, 10).until(
            EC.visibility_of_element_located((By.CSS_SELECTOR, "footer"))
        )
        assert "RoadSense" in footer.text, \
            f"'RoadSense' not found in footer. Footer text: {footer.text[:200]}"

    def test_no_severe_js_errors(self, driver, base_url):
        """No SEVERE JavaScript errors must appear in the browser console."""
        self._load(driver, base_url)
        time.sleep(2)
        logs = driver.get_log("browser")
        severe = [
            l for l in logs
            if l.get("level") == "SEVERE"
            and "favicon" not in l.get("message", "").lower()
        ]
        assert len(severe) == 0, f"Severe JS errors on home page: {severe}"

    def test_body_has_content(self, driver, base_url):
        """Body must contain enough text to confirm the app rendered."""
        self._load(driver, base_url)
        body_text = driver.find_element(By.TAG_NAME, "body").text.strip()
        assert len(body_text) > 100, \
            f"Body appears blank. Text length: {len(body_text)}"
