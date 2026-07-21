from selenium.webdriver.common.by import By
from automation.pages.base_page import BasePage
from automation.config.config import config, Routes

class DashboardPage(BasePage):
    GLASS_PANELS  = (By.CSS_SELECTOR, '.glass-panel')
    DISTANCE_LBL  = (By.XPATH, "//*[contains(text(),'Distance')]")
    SAFETY_LBL    = (By.XPATH, "//*[contains(text(),'Safety') or contains(text(),'Safe')]")
    NAV_HEADER    = (By.CSS_SELECTOR, 'nav.nav-header')
    BODY          = (By.TAG_NAME, 'body')

    def open(self):
        self.navigate_to(f"{config.BASE_URL.rstrip('/')}/{Routes.DASHBOARD}")

    def get_panel_count(self): return self.count_elements(*self.GLASS_PANELS)
    def has_distance_label(self): return self.is_element_present(*self.DISTANCE_LBL)
    def has_safety_label(self): return self.is_element_present(*self.SAFETY_LBL)
    def is_nav_visible(self): return self.is_element_visible(*self.NAV_HEADER)
    def get_body_text(self): return self.driver.find_element(*self.BODY).text
