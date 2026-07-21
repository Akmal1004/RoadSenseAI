"""Test data for RoadSenseAI Selenium automation framework."""

# Route data
ROUTES = {
    'bangalore_mysore': {'source': 'Bangalore', 'dest': 'Mysore'},
    'delhi_agra': {'source': 'Delhi', 'dest': 'Agra'},
    'mumbai_pune': {'source': 'Mumbai', 'dest': 'Pune'},
    'chennai_vellore': {'source': 'Chennai', 'dest': 'Vellore'},
    'hyderabad_vijayawada': {'source': 'Hyderabad', 'dest': 'Vijayawada'},
}

# Input validation data
INVALID_INPUTS = [
    '',
    ' ',
    '!@#$%^&*()',
    'A' * 200,
    '<script>alert(1)</script>',
    '123456',
    'SELECT * FROM users',
    '\n\t\r',
]

VALID_CITIES = [
    'Bangalore', 'Mumbai', 'Delhi', 'Chennai', 'Hyderabad',
    'Kolkata', 'Pune', 'Mysore', 'Agra', 'Jaipur',
]

# Chat messages for co-pilot
CHAT_MESSAGES = [
    'What is the safest route to Mysore?',
    'Show me nearby hospitals on NH44',
    'What is the traffic situation right now?',
    'Find fuel stations near me',
    'Suggest an eco-friendly route',
]

# Viewport sizes for responsive tests
VIEWPORTS = [
    {'name': 'Mobile S', 'width': 320, 'height': 568},
    {'name': 'Mobile M', 'width': 375, 'height': 667},
    {'name': 'iPhone 14', 'width': 390, 'height': 844},
    {'name': 'Tablet', 'width': 768, 'height': 1024},
    {'name': 'Laptop', 'width': 1280, 'height': 800},
    {'name': 'Desktop', 'width': 1440, 'height': 900},
    {'name': 'Wide', 'width': 1920, 'height': 1080},
]

# Navigation test cases
NAV_LINKS = [
    ('Home', ''),
    ('Console', '#/console'),
    ('Dashboard', '#/dashboard'),
    ('AI Co-Pilot', '#/copilot'),
    ('Settings', '#/settings'),
]

# Expected page elements
PAGE_ELEMENTS = {
    'home': ['nav.nav-header', 'header.glass-panel', 'footer'],
    'console': ["input[type='text']"],
    'dashboard': ['.glass-panel'],
    'copilot': [],
    'settings': ['.glass-panel'],
}

# Performance thresholds
PERF_THRESHOLDS = {
    'page_load_ms': 5000,
    'dom_ready_ms': 3000,
    'first_paint_ms': 2000,
}
