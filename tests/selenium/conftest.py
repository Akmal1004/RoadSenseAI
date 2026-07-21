"""
conftest.py – Shared Selenium fixtures for RoadSenseAI UI tests.

Provides:
  - A headless Chrome WebDriver (function-scoped, fresh per test)
  - A base_url fixture pointing to the Vite preview server
  - A --base-url CLI option for CI overrides
"""

import pytest
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager

# Default Vite preview port
DEFAULT_BASE_URL = "http://localhost:4173"


def pytest_addoption(parser):
    parser.addoption(
        "--base-url",
        action="store",
        default=DEFAULT_BASE_URL,
        help="Base URL of the running RoadSenseAI Vite app (default: http://localhost:4173)",
    )


@pytest.fixture(scope="session")
def base_url(request):
    """Session-wide base URL – overridable via --base-url CLI flag."""
    return request.config.getoption("--base-url")


@pytest.fixture(scope="function")
def driver():
    """
    Headless Chrome WebDriver.
    Created fresh before every test, torn down after.
    """
    options = Options()
    options.add_argument("--headless")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-gpu")
    options.add_argument("--window-size=1440,900")
    options.add_argument("--disable-web-security")
    options.add_argument("--allow-running-insecure-content")
    options.add_argument("--log-level=3")          # suppress verbose chrome logs

    service = Service(ChromeDriverManager().install())
    drv = webdriver.Chrome(service=service, options=options)
    drv.implicitly_wait(10)

    yield drv

    drv.quit()
