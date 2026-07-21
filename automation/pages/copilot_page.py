from selenium.webdriver.common.by import By
from automation.pages.base_page import BasePage
from automation.config.config import config, Routes

class CopilotPage(BasePage):
    CHAT_TEXTAREA = (By.CSS_SELECTOR, 'textarea')
    CHAT_INPUT    = (By.CSS_SELECTOR, "input[type='text']")
    ALL_BUTTONS   = (By.CSS_SELECTOR, 'button')
    NAV_HEADER    = (By.CSS_SELECTOR, 'nav.nav-header')
    BODY          = (By.TAG_NAME, 'body')

    def open(self):
        self.navigate_to(f"{config.BASE_URL.rstrip('/')}/{Routes.COPILOT}")

    def get_chat_input(self):
        if self.is_element_present(*self.CHAT_TEXTAREA, timeout=3):
            return self.driver.find_element(*self.CHAT_TEXTAREA)
        elif self.is_element_present(*self.CHAT_INPUT, timeout=3):
            return self.driver.find_element(*self.CHAT_INPUT)
        return None

    def type_message(self, text: str):
        inp = self.get_chat_input()
        if inp: inp.clear(); inp.send_keys(text)

    def has_chat_input(self): return self.get_chat_input() is not None
    def get_button_count(self): return self.count_elements(*self.ALL_BUTTONS)
    def is_nav_visible(self): return self.is_element_visible(*self.NAV_HEADER)
    def get_body_text(self): return self.driver.find_element(*self.BODY).text
