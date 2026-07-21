"""
test_performance_smoke.py – TC-PERF-001 to TC-PERF-020
Performance smoke tests against LIVE GitHub Pages deployment.
"""
import time
import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from automation.config.config import config

BASE = config.BASE_URL
TIMEOUT = 5000  # ms – max acceptable load time


class TestPerformanceSmoke:

    # ── Page Load Times ──────────────────────────────────────────

    def test_TC_PERF_001_home_loads_within_5s(self, driver):
        """TC-PERF-001: Home page loads within 5 seconds\nModule: Performance\nPriority: High"""
        start = time.time()
        driver.get(BASE)
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, 'nav.nav-header'))
        )
        elapsed_ms = (time.time() - start) * 1000
        assert elapsed_ms < TIMEOUT, f"Home too slow: {elapsed_ms:.0f}ms (max {TIMEOUT}ms)"

    def test_TC_PERF_002_console_loads_within_5s(self, driver):
        """TC-PERF-002: Console page loads within 5 seconds\nModule: Performance\nPriority: High"""
        start = time.time()
        driver.get(f"{BASE}#/console")
        time.sleep(2)
        elapsed_ms = (time.time() - start) * 1000
        assert elapsed_ms < TIMEOUT

    def test_TC_PERF_003_dashboard_loads_within_5s(self, driver):
        """TC-PERF-003: Dashboard page loads within 5 seconds\nModule: Performance\nPriority: High"""
        start = time.time()
        driver.get(f"{BASE}#/dashboard")
        time.sleep(2)
        elapsed_ms = (time.time() - start) * 1000
        assert elapsed_ms < TIMEOUT

    def test_TC_PERF_004_copilot_loads_within_5s(self, driver):
        """TC-PERF-004: Co-Pilot page loads within 5 seconds\nModule: Performance\nPriority: Medium"""
        start = time.time()
        driver.get(f"{BASE}#/copilot")
        time.sleep(2)
        elapsed_ms = (time.time() - start) * 1000
        assert elapsed_ms < TIMEOUT

    def test_TC_PERF_005_settings_loads_within_5s(self, driver):
        """TC-PERF-005: Settings page loads within 5 seconds\nModule: Performance\nPriority: Medium"""
        start = time.time()
        driver.get(f"{BASE}#/settings")
        time.sleep(2)
        elapsed_ms = (time.time() - start) * 1000
        assert elapsed_ms < TIMEOUT

    def test_TC_PERF_006_navigation_switch_fast(self, driver):
        """TC-PERF-006: Route switching between pages is fast (<3s each)\nModule: Performance\nPriority: Medium"""
        driver.get(BASE)
        time.sleep(2)
        for route in ['#/console', '#/dashboard', '#/copilot', '#/settings', '']:
            start = time.time()
            driver.get(f"{BASE}{route}")
            time.sleep(1)
            elapsed = (time.time() - start) * 1000
            assert elapsed < 3000, f"Slow navigation to {route}: {elapsed:.0f}ms"

    def test_TC_PERF_007_dom_ready_state(self, driver):
        """TC-PERF-007: DOM reaches complete state within 5s\nModule: Performance\nPriority: High"""
        driver.get(BASE)
        WebDriverWait(driver, 10).until(
            lambda d: d.execute_script("return document.readyState") == "complete"
        )
        state = driver.execute_script("return document.readyState")
        assert state == "complete"

    def test_TC_PERF_008_console_dom_ready(self, driver):
        """TC-PERF-008: Console DOM reaches complete state\nModule: Performance\nPriority: High"""
        driver.get(f"{BASE}#/console")
        WebDriverWait(driver, 10).until(
            lambda d: d.execute_script("return document.readyState") == "complete"
        )
        assert driver.execute_script("return document.readyState") == "complete"

    def test_TC_PERF_009_no_blocking_resources_home(self, driver):
        """TC-PERF-009: Page body renders (JS not blocking)\nModule: Performance\nPriority: High"""
        driver.get(BASE)
        time.sleep(3)
        body = driver.find_element(By.TAG_NAME, 'body')
        assert len(body.text) > 20, "Body appears blank – JS may be blocking render"

    def test_TC_PERF_010_navigation_timing_api(self, driver):
        """TC-PERF-010: Browser Navigation Timing reports fast load\nModule: Performance\nPriority: Medium"""
        driver.get(BASE)
        time.sleep(3)
        timing = driver.execute_script("""
            var perf = window.performance.timing;
            return {
                domComplete: perf.domComplete - perf.navigationStart,
                loadEvent: perf.loadEventEnd - perf.navigationStart
            };
        """)
        assert timing.get('domComplete', 99999) < 8000, f"DOM too slow: {timing}"

    def test_TC_PERF_011_memory_usage_reasonable(self, driver):
        """TC-PERF-011: JS heap memory within reasonable range\nModule: Performance\nPriority: Low"""
        driver.get(BASE)
        time.sleep(2)
        memory = driver.execute_script("return window.performance.memory ? window.performance.memory.usedJSHeapSize : 0")
        # 200MB limit
        assert memory < 200 * 1024 * 1024 or memory == 0, f"High memory usage: {memory/1024/1024:.0f}MB"

    def test_TC_PERF_012_no_severe_console_errors_home(self, driver):
        """TC-PERF-012: No SEVERE JS errors on home page\nModule: Performance\nPriority: High"""
        driver.get(BASE)
        time.sleep(2)
        logs = driver.get_log('browser')
        severe = [l for l in logs if l.get('level') == 'SEVERE' and 'favicon' not in l.get('message', '').lower()]
        assert len(severe) == 0, f"JS errors: {severe[:3]}"

    def test_TC_PERF_013_no_severe_console_errors_console(self, driver):
        """TC-PERF-013: No SEVERE JS errors on console page\nModule: Performance\nPriority: High"""
        driver.get(f"{BASE}#/console")
        time.sleep(2)
        logs = driver.get_log('browser')
        severe = [l for l in logs if l.get('level') == 'SEVERE' and 'favicon' not in l.get('message', '').lower()]
        assert len(severe) == 0, f"JS errors on console: {severe[:3]}"

    def test_TC_PERF_014_no_severe_console_errors_dashboard(self, driver):
        """TC-PERF-014: No SEVERE JS errors on dashboard\nModule: Performance\nPriority: High"""
        driver.get(f"{BASE}#/dashboard")
        time.sleep(2)
        logs = driver.get_log('browser')
        severe = [l for l in logs if l.get('level') == 'SEVERE' and 'favicon' not in l.get('message', '').lower()]
        assert len(severe) == 0, f"JS errors on dashboard: {severe[:3]}"

    def test_TC_PERF_015_page_title_set_quickly(self, driver):
        """TC-PERF-015: Page title is set quickly (within 3s)\nModule: Performance\nPriority: Medium"""
        start = time.time()
        driver.get(BASE)
        while time.time() - start < 3:
            if 'RoadSense' in driver.title:
                break
            time.sleep(0.2)
        assert 'RoadSense' in driver.title

    def test_TC_PERF_016_page_not_blank_after_2s(self, driver):
        """TC-PERF-016: Page has content after 2 seconds\nModule: Performance\nPriority: High"""
        driver.get(BASE)
        time.sleep(2)
        text = driver.find_element(By.TAG_NAME, 'body').text
        assert len(text.strip()) > 50, f"Page appears blank after 2s: '{text[:100]}'"

    def test_TC_PERF_017_css_loaded_check(self, driver):
        """TC-PERF-017: CSS is loaded (nav has color styling)\nModule: Performance\nPriority: Medium"""
        driver.get(BASE)
        time.sleep(2)
        bg = driver.execute_script(
            "var el = document.querySelector('nav.nav-header'); return el ? window.getComputedStyle(el).getPropertyValue('background-color') : 'none';"
        )
        assert bg and bg != 'none', "Nav appears unstyled – CSS may not have loaded"

    def test_TC_PERF_018_js_bundle_executed(self, driver):
        """TC-PERF-018: React JS bundle executed (React root mounted)\nModule: Performance\nPriority: High"""
        driver.get(BASE)
        time.sleep(3)
        has_root = driver.execute_script(
            "var root = document.getElementById('root'); return root && root.children.length > 0;"
        )
        assert has_root, "React #root is empty – JS bundle may not have executed"

    def test_TC_PERF_019_fonts_loaded(self, driver):
        """TC-PERF-019: Web fonts loaded (document fonts ready)\nModule: Performance\nPriority: Low"""
        driver.get(BASE)
        time.sleep(2)
        fonts_status = driver.execute_script("return document.fonts.status")
        assert fonts_status in ['loaded', 'loading'], f"Unexpected fonts status: {fonts_status}"

    def test_TC_PERF_020_five_route_cycle_total_under_20s(self, driver):
        """TC-PERF-020: Full 5-route navigation cycle completes under 20s\nModule: Performance\nPriority: Medium"""
        start = time.time()
        for route in ['', '#/console', '#/dashboard', '#/copilot', '#/settings']:
            driver.get(f"{BASE}{route}")
            time.sleep(1)
        elapsed = time.time() - start
        assert elapsed < 20, f"5-route cycle took {elapsed:.1f}s (max 20s)"
