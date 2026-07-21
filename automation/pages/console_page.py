from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from automation.pages.base_page import BasePage
from automation.config.config import config, Routes

class ConsolePage(BasePage):
    SOURCE_INPUT  = (By.CSS_SELECTOR, "input[type='text']:nth-of-type(1)")
    DEST_INPUT    = (By.CSS_SELECTOR, "input[type='text']:nth-of-type(2)")
    ALL_INPUTS    = (By.CSS_SELECTOR, "input[type='text']")
    FUEL_CHIP     = (By.XPATH, "//*[contains(text(),'Fuel')]")
    HOSPITAL_CHIP = (By.XPATH, "//*[contains(text(),'Hospital')]")
    PARKING_CHIP  = (By.XPATH, "//*[contains(text(),'Parking')]")
    SAFEST_OPT    = (By.XPATH, "//*[contains(text(),'Safest')]")
    FASTEST_OPT   = (By.XPATH, "//*[contains(text(),'Fastest')]")
    ECO_OPT       = (By.XPATH, "//*[contains(text(),'Eco')]")
    ALL_BUTTONS   = (By.CSS_SELECTOR, 'button')

    def open(self):
        self.navigate_to(f"{config.BASE_URL.rstrip('/')}/{Routes.CONSOLE}")

    def get_source_input(self):
        inputs = self.driver.find_elements(*self.ALL_INPUTS)
        return inputs[0] if inputs else None

    def get_dest_input(self):
        inputs = self.driver.find_elements(*self.ALL_INPUTS)
        return inputs[1] if len(inputs) > 1 else None

    def type_source(self, text: str):
        inp = self.get_source_input()
        if inp: inp.clear(); inp.send_keys(text)

    def type_destination(self, text: str):
        inp = self.get_dest_input()
        if inp: inp.clear(); inp.send_keys(text)

    def clear_source(self):
        inp = self.get_source_input()
        if inp: inp.send_keys(Keys.CONTROL + 'a'); inp.send_keys(Keys.DELETE)

    def get_input_count(self): return self.count_elements(*self.ALL_INPUTS)
    def get_button_count(self): return self.count_elements(*self.ALL_BUTTONS)
    def has_fuel_chip(self): return self.is_element_present(*self.FUEL_CHIP)
    def has_hospital_chip(self): return self.is_element_present(*self.HOSPITAL_CHIP)
    def has_parking_chip(self): return self.is_element_present(*self.PARKING_CHIP)
    def has_safest_option(self): return self.is_element_present(*self.SAFEST_OPT)
    def has_fastest_option(self): return self.is_element_present(*self.FASTEST_OPT)
    def has_eco_option(self): return self.is_element_present(*self.ECO_OPT)
