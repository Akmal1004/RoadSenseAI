from selenium.webdriver.common.by import By
from automation.pages.base_page import BasePage
from automation.config.config import config, Routes

class HomePage(BasePage):
    # Locators
    NAV_HEADER    = (By.CSS_SELECTOR, 'nav.nav-header')
    NAV_HOME      = (By.XPATH, "//nav[contains(@class,'nav-header')]//a[text()='Home']")
    NAV_CONSOLE   = (By.XPATH, "//nav[contains(@class,'nav-header')]//a[text()='Console']")
    NAV_DASHBOARD = (By.XPATH, "//nav[contains(@class,'nav-header')]//a[text()='Dashboard']")
    NAV_COPILOT   = (By.XPATH, "//nav[contains(@class,'nav-header')]//a[text()='AI Co-Pilot']")
    NAV_SETTINGS  = (By.XPATH, "//nav[contains(@class,'nav-header')]//a[text()='Settings']")
    HERO_SECTION  = (By.CSS_SELECTOR, 'header.glass-panel')
    LAUNCH_BTN    = (By.XPATH, "//a[contains(text(),'Launch App')]")
    NO_TRIP_BADGE = (By.XPATH, "//*[contains(text(),'No Active Trip')]")
    FOOTER        = (By.CSS_SELECTOR, 'footer')
    BODY          = (By.TAG_NAME, 'body')

    def open(self):
        self.navigate_to(config.BASE_URL)

    def get_nav(self): return self.wait_for_element(*self.NAV_HEADER)
    def get_hero(self): return self.wait_for_element(*self.HERO_SECTION)
    def click_launch(self): self.click(*self.LAUNCH_BTN)
    def click_console(self): self.click(*self.NAV_CONSOLE)
    def click_dashboard(self): self.click(*self.NAV_DASHBOARD)
    def click_copilot(self): self.click(*self.NAV_COPILOT)
    def click_settings(self): self.click(*self.NAV_SETTINGS)
    def get_footer(self): return self.wait_for_element(*self.FOOTER)
    def is_nav_visible(self): return self.is_element_visible(*self.NAV_HEADER)
    def is_hero_visible(self): return self.is_element_visible(*self.HERO_SECTION)
    def is_footer_visible(self): return self.is_element_visible(*self.FOOTER)
    def get_body_text(self): return self.driver.find_element(*self.BODY).text
    def has_no_trip_badge(self): return self.is_element_present(*self.NO_TRIP_BADGE)
    def get_nav_text(self): return self.get_text(*self.NAV_HEADER)
