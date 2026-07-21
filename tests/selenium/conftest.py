"""
conftest.py – Shared Selenium fixtures for RoadSenseAI UI tests.

Uses Selenium 4.6+ built-in selenium-manager (no webdriver-manager needed).
ChromeDriver is auto-downloaded to match the installed Chrome version.
"""

import pytest
from selenium import webdriver
from selenium.webdriver.chrome.options import Options

DEFAULT_BASE_URL = "http://localhost:4173"


def pytest_addoption(parser):
    parser.addoption(
        "--base-url",
        action="store",
        default=DEFAULT_BASE_URL,
        help="Base URL of the running RoadSenseAI Vite app",
    )


@pytest.fixture(scope="session")
def base_url(request):
    return request.config.getoption("--base-url")


@pytest.fixture(scope="function")
def driver():
    """
    Headless Chrome WebDriver using Selenium 4.6+ selenium-manager.
    No webdriver-manager import needed – Selenium handles driver download automatically.
    """
    options = Options()
    options.add_argument("--headless=new")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-gpu")
    options.add_argument("--window-size=1440,900")
    options.add_argument("--disable-web-security")
    options.add_argument("--allow-running-insecure-content")
    options.add_argument("--remote-debugging-port=9222")
    options.add_argument("--log-level=3")

    drv = webdriver.Chrome(options=options)
    drv.implicitly_wait(10)

    yield drv

    drv.quit()
