import os
import logging
from datetime import datetime
from automation.config.config import config

def setup_logger(name: str = 'roadsense_automation') -> logging.Logger:
    os.makedirs(config.LOG_DIR, exist_ok=True)
    log_file = os.path.join(config.LOG_DIR, f'test_run_{datetime.now().strftime("%Y%m%d_%H%M%S")}.log')
    
    logger = logging.getLogger(name)
    logger.setLevel(logging.DEBUG)
    
    if not logger.handlers:
        fh = logging.FileHandler(log_file)
        fh.setLevel(logging.DEBUG)
        ch = logging.StreamHandler()
        ch.setLevel(logging.INFO)
        
        fmt = logging.Formatter('[%(asctime)s][%(levelname)s][%(name)s] %(message)s', '%Y-%m-%d %H:%M:%S')
        fh.setFormatter(fmt)
        ch.setFormatter(fmt)
        
        logger.addHandler(fh)
        logger.addHandler(ch)
    
    return logger

logger = setup_logger()
