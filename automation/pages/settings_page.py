from selenium.webdriver.common.by import By
from automation.pages.base_page import BasePage
from automation.config.config import config, Routes

class SettingsPage(BasePage):
    GLASS_PANELS = (By.CSS_SELECTOR, '.glass-panel')
    NAV_HEADER   = (By.CSS_SELECTOR, 'nav.nav-header')
    ALL_INPUTS   = (By.CSS_SELECTOR, 'input')
    ALL_BUTTONS  = (By.CSS_SELECTOR, 'button')
    BODY         = (By.TAG_NAME, 'body')

    def open(self):
        self.navigate_to(f"{config.BASE_URL.rstrip('/')}/{Routes.SETTINGS}")

    def get_panel_count(self): return self.count_elements(*self.GLASS_PANELS)
    def is_nav_visible(self): return self.is_element_visible(*self.NAV_HEADER)
    def get_input_count(self): return self.count_elements(*self.ALL_INPUTS)
    def get_button_count(self): return self.count_elements(*self.ALL_BUTTONS)
    def get_body_text(self): return self.driver.find_element(*self.BODY).text
