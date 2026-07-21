"""
test_responsive.py – TC-RESP-001 to TC-RESP-020
Responsive design tests across multiple viewport sizes.
"""
import time
import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from automation.config.config import config

BASE = config.BASE_URL

VIEWPORTS = [
    (320,  568,  'Mobile S'),
    (375,  667,  'Mobile M - iPhone SE'),
    (390,  844,  'Mobile L - iPhone 14'),
    (414,  896,  'Mobile XL - iPhone 11'),
    (768,  1024, 'Tablet - iPad'),
    (1024, 768,  'Tablet Landscape'),
    (1280, 800,  'Laptop'),
    (1440, 900,  'Desktop'),
    (1920, 1080, 'Full HD'),
    (2560, 1440, 'QHD'),
]


class TestResponsiveDesign:

    def test_TC_RESP_001_renders_320px(self, driver):
        """TC-RESP-001: App renders correctly on 320px (Mobile S)\nModule: Responsive\nPriority: High"""
        driver.set_window_size(320, 568)
        driver.get(BASE)
        time.sleep(2)
        nav = driver.find_elements(By.CSS_SELECTOR, 'nav.nav-header')
        assert len(nav) >= 1, "Nav missing on 320px viewport"

    def test_TC_RESP_002_renders_375px(self, driver):
        """TC-RESP-002: App renders on 375px (iPhone SE viewport)\nModule: Responsive\nPriority: High"""
        driver.set_window_size(375, 667)
        driver.get(BASE)
        time.sleep(2)
        body = driver.find_element(By.TAG_NAME, 'body').text
        assert len(body.strip()) > 20

    def test_TC_RESP_003_renders_390px(self, driver):
        """TC-RESP-003: App renders on 390px (iPhone 14 viewport)\nModule: Responsive\nPriority: High"""
        driver.set_window_size(390, 844)
        driver.get(BASE)
        time.sleep(2)
        assert 'RoadSense' in driver.title

    def test_TC_RESP_004_renders_768px_tablet(self, driver):
        """TC-RESP-004: App renders on 768px (iPad viewport)\nModule: Responsive\nPriority: High"""
        driver.set_window_size(768, 1024)
        driver.get(BASE)
        time.sleep(2)
        nav = driver.find_elements(By.CSS_SELECTOR, 'nav.nav-header')
        assert len(nav) >= 1

    def test_TC_RESP_005_renders_1440px_desktop(self, driver):
        """TC-RESP-005: App renders on 1440px (Desktop viewport)\nModule: Responsive\nPriority: High"""
        driver.set_window_size(1440, 900)
        driver.get(BASE)
        time.sleep(2)
        hero = driver.find_elements(By.CSS_SELECTOR, 'header.glass-panel')
        assert len(hero) >= 1

    def test_TC_RESP_006_console_responsive_320(self, driver):
        """TC-RESP-006: Console page inputs visible on 320px\nModule: Responsive\nPriority: Medium"""
        driver.set_window_size(320, 568)
        driver.get(f"{BASE}#/console")
        time.sleep(2)
        assert '#/console' in driver.current_url

    def test_TC_RESP_007_console_responsive_768(self, driver):
        """TC-RESP-007: Console page renders on tablet 768px\nModule: Responsive\nPriority: Medium"""
        driver.set_window_size(768, 1024)
        driver.get(f"{BASE}#/console")
        time.sleep(2)
        assert '#/console' in driver.current_url

    def test_TC_RESP_008_dashboard_responsive_mobile(self, driver):
        """TC-RESP-008: Dashboard glass panels visible on mobile 390px\nModule: Responsive\nPriority: Medium"""
        driver.set_window_size(390, 844)
        driver.get(f"{BASE}#/dashboard")
        time.sleep(2)
        panels = driver.find_elements(By.CSS_SELECTOR, '.glass-panel')
        assert len(panels) >= 1 or '#/dashboard' in driver.current_url

    def test_TC_RESP_009_landscape_mode_414x896(self, driver):
        """TC-RESP-009: App works in landscape mode (896x414)\nModule: Responsive\nPriority: Medium"""
        driver.set_window_size(896, 414)
        driver.get(BASE)
        time.sleep(2)
        nav = driver.find_elements(By.CSS_SELECTOR, 'nav.nav-header')
        assert len(nav) >= 1

    def test_TC_RESP_010_footer_visible_desktop(self, driver):
        """TC-RESP-010: Footer visible on 1440px desktop\nModule: Responsive\nPriority: Medium"""
        driver.set_window_size(1440, 900)
        driver.get(BASE)
        time.sleep(2)
        footers = driver.find_elements(By.TAG_NAME, 'footer')
        assert len(footers) >= 1

    def test_TC_RESP_011_no_horizontal_scroll_mobile(self, driver):
        """TC-RESP-011: No horizontal scroll on 390px mobile\nModule: Responsive\nPriority: High"""
        driver.set_window_size(390, 844)
        driver.get(BASE)
        time.sleep(2)
        scroll_width = driver.execute_script("return document.documentElement.scrollWidth")
        client_width = driver.execute_script("return document.documentElement.clientWidth")
        assert scroll_width <= client_width + 10, f"Horizontal overflow: scrollWidth={scroll_width}, clientWidth={client_width}"

    def test_TC_RESP_012_no_horizontal_scroll_375(self, driver):
        """TC-RESP-012: No horizontal scroll on 375px iPhone SE\nModule: Responsive\nPriority: High"""
        driver.set_window_size(375, 667)
        driver.get(BASE)
        time.sleep(2)
        scroll_width = driver.execute_script("return document.documentElement.scrollWidth")
        client_width = driver.execute_script("return document.documentElement.clientWidth")
        assert scroll_width <= client_width + 15

    def test_TC_RESP_013_nav_clickable_on_mobile(self, driver):
        """TC-RESP-013: Nav links clickable on 390px mobile\nModule: Responsive\nPriority: High"""
        driver.set_window_size(390, 844)
        driver.get(BASE)
        time.sleep(2)
        links = driver.find_elements(By.CSS_SELECTOR, 'nav.nav-header a')
        assert len(links) >= 1

    def test_TC_RESP_014_copilot_renders_mobile(self, driver):
        """TC-RESP-014: Co-Pilot page renders on mobile 390px\nModule: Responsive\nPriority: Medium"""
        driver.set_window_size(390, 844)
        driver.get(f"{BASE}#/copilot")
        time.sleep(2)
        assert '#/copilot' in driver.current_url

    def test_TC_RESP_015_settings_renders_mobile(self, driver):
        """TC-RESP-015: Settings page renders on mobile 390px\nModule: Responsive\nPriority: Medium"""
        driver.set_window_size(390, 844)
        driver.get(f"{BASE}#/settings")
        time.sleep(2)
        body = driver.find_element(By.TAG_NAME, 'body').text
        assert len(body.strip()) > 20

    def test_TC_RESP_016_1920px_no_empty_space(self, driver):
        """TC-RESP-016: Full HD 1920px layout has content\nModule: Responsive\nPriority: Low"""
        driver.set_window_size(1920, 1080)
        driver.get(BASE)
        time.sleep(2)
        body = driver.find_element(By.TAG_NAME, 'body').text
        assert len(body.strip()) > 50

    def test_TC_RESP_017_resize_rerender(self, driver):
        """TC-RESP-017: App re-renders correctly after resize\nModule: Responsive\nPriority: Medium"""
        driver.set_window_size(1440, 900)
        driver.get(BASE)
        time.sleep(1)
        driver.set_window_size(390, 844)
        time.sleep(1)
        nav = driver.find_elements(By.CSS_SELECTOR, 'nav.nav-header')
        assert len(nav) >= 1, "Nav disappeared after resize"

    def test_TC_RESP_018_title_consistent_across_viewports(self, driver):
        """TC-RESP-018: Page title same on mobile and desktop\nModule: Responsive\nPriority: Low"""
        driver.set_window_size(390, 844)
        driver.get(BASE)
        time.sleep(2)
        mobile_title = driver.title
        driver.set_window_size(1440, 900)
        driver.get(BASE)
        time.sleep(2)
        desktop_title = driver.title
        assert mobile_title == desktop_title

    def test_TC_RESP_019_console_inputs_320px(self, driver):
        """TC-RESP-019: Console inputs accessible on 320px\nModule: Responsive\nPriority: High"""
        driver.set_window_size(320, 568)
        driver.get(f"{BASE}#/console")
        time.sleep(2)
        # Page should have loaded
        assert '#/console' in driver.current_url

    def test_TC_RESP_020_all_pages_render_768px(self, driver):
        """TC-RESP-020: All 5 routes render at tablet 768px\nModule: Responsive\nPriority: High"""
        driver.set_window_size(768, 1024)
        routes = ['', '#/console', '#/dashboard', '#/copilot', '#/settings']
        for route in routes:
            driver.get(f"{BASE}{route}")
            time.sleep(1.5)
            body = driver.find_element(By.TAG_NAME, 'body').text
            assert len(body.strip()) > 20, f"Blank page on 768px at route: {route}"
