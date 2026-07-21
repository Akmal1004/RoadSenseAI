import os
from dataclasses import dataclass

@dataclass
class Config:
    BASE_URL: str = os.environ.get('BASE_URL', 'https://akmal1004.github.io/RoadSenseAI/')
    HEADLESS: bool = os.environ.get('HEADLESS', 'true').lower() == 'true'
    IMPLICIT_WAIT: int = int(os.environ.get('IMPLICIT_WAIT', '10'))
    EXPLICIT_WAIT: int = int(os.environ.get('EXPLICIT_WAIT', '20'))
    PAGE_LOAD_TIMEOUT: int = int(os.environ.get('PAGE_LOAD_TIMEOUT', '30'))
    RETRY_COUNT: int = int(os.environ.get('RETRY_COUNT', '2'))
    SCREENSHOT_DIR: str = os.environ.get('SCREENSHOT_DIR', 'automation/screenshots')
    LOG_DIR: str = os.environ.get('LOG_DIR', 'automation/logs')
    REPORT_DIR: str = os.environ.get('REPORT_DIR', 'automation/reports')
    WINDOW_WIDTH: int = 1440
    WINDOW_HEIGHT: int = 900

config = Config()

# Route constants - all use hash routing
class Routes:
    HOME = ''
    CONSOLE = '#/console'
    DASHBOARD = '#/dashboard'
    COPILOT = '#/copilot'
    SETTINGS = '#/settings'
    
    @staticmethod
    def url(route: str) -> str:
        return f"{config.BASE_URL.rstrip('/')}/{route}"
