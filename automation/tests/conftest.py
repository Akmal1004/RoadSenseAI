import os
import sys
import time
import json
import pytest
import logging
from datetime import datetime
from typing import Generator

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from selenium import webdriver
from automation.utils.driver_factory import DriverFactory
from automation.utils.screenshot_utils import ScreenshotUtils
from automation.config.config import config

logger = logging.getLogger(__name__)

# Global test results store
TEST_RESULTS = []
START_TIME = time.time()

@pytest.fixture(scope='session')
def base_url():
    return config.BASE_URL

@pytest.fixture(scope='function')
def driver() -> Generator[webdriver.Chrome, None, None]:
    drv = DriverFactory.create_driver()
    yield drv
    drv.quit()

@pytest.fixture(scope='function')
def mobile_driver() -> Generator[webdriver.Chrome, None, None]:
    drv = DriverFactory.create_mobile_driver()
    yield drv
    drv.quit()

@pytest.hookimpl(tryfirst=True, hookwrapper=True)
def pytest_runtest_makereport(item, call):
    outcome = yield
    report = outcome.get_result()
    
    if report.when == 'call':
        status = 'PASSED' if report.passed else ('FAILED' if report.failed else 'SKIPPED')
        
        # Parse test metadata from docstring
        doc = item.function.__doc__ or ''
        lines = [l.strip() for l in doc.strip().split('\n') if l.strip()]
        
        test_id = next((l.split(':',1)[1].strip() for l in lines if l.startswith('TC-')), 
                       item.nodeid.split('::')[-1])
        module = next((l.split(':',1)[1].strip() for l in lines if 'Module:' in l),
                      item.nodeid.split('/')[1] if '/' in item.nodeid else 'General')
        priority = next((l.split(':',1)[1].strip() for l in lines if 'Priority:' in l), 'Medium')
        
        error_msg = ''
        screenshot_path = ''
        
        if report.failed:
            error_msg = str(report.longrepr)[:300] if report.longrepr else 'Unknown error'
            # Capture screenshot on failure
            try:
                driver_fixture = item.funcargs.get('driver') or item.funcargs.get('mobile_driver')
                if driver_fixture:
                    sc = ScreenshotUtils(driver_fixture)
                    screenshot_path = sc.capture_on_failure(test_id)
            except Exception:
                pass
        
        result = {
            'id': test_id,
            'name': item.name.replace('test_', '').replace('_', ' ').title(),
            'module': module.replace('test_', '').replace('_', ' ').title() if module else 'General',
            'status': status,
            'priority': priority,
            'duration': report.duration,
            'error': error_msg,
            'screenshot': screenshot_path,
            'timestamp': datetime.now().isoformat(),
        }
        TEST_RESULTS.append(result)

def pytest_sessionfinish(session, exitstatus):
    """Generate all reports at end of test session."""
    # Ensure results directory exists
    for d in ['automation/reports/Excel', 'automation/reports/HTML',
              'automation/reports/JSON', 'automation/reports/Summary',
              'automation/screenshots', 'automation/logs']:
        os.makedirs(d, exist_ok=True)
    
    total = len(TEST_RESULTS)
    passed = sum(1 for t in TEST_RESULTS if t['status'] == 'PASSED')
    failed = sum(1 for t in TEST_RESULTS if t['status'] == 'FAILED')
    skipped = sum(1 for t in TEST_RESULTS if t['status'] == 'SKIPPED')
    duration = time.time() - START_TIME
    pass_rate = (passed / total * 100) if total > 0 else 0
    
    summary = {
        'total': total, 'executed': total, 'passed': passed,
        'failed': failed, 'skipped': skipped,
        'pass_rate': pass_rate, 'duration': duration,
        'date': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        'base_url': config.BASE_URL,
    }
    
    # Generate reports
    try:
        from automation.utils.excel_reporter import ExcelReporter
        from automation.utils.html_reporter import HTMLReporter
        ExcelReporter(TEST_RESULTS, summary).generate_all()
        HTMLReporter(TEST_RESULTS, summary).generate_all()
        _write_summary_md(summary, TEST_RESULTS)
        print(f"\n✅ Reports generated. Total:{total} Passed:{passed} Failed:{failed} Rate:{pass_rate:.1f}%")
    except Exception as e:
        print(f"⚠️  Report generation error: {e}")

def _write_summary_md(summary: dict, results: list):
    failed = [r for r in results if r['status'] == 'FAILED']
    failed_list = '\n'.join(f'- `{r["id"]}` – {r["name"]}: {(r.get("error") or "")[:80]}' for r in failed[:20])
    
    md = f"""# 🚦 Live GitHub Pages E2E Execution Summary

## Deployment
**Base URL:** {summary['base_url']}

## Results
| Metric | Value |
|--------|-------|
| Total Tests | {summary['total']} |
| Passed | ✅ {summary['passed']} |
| Failed | ❌ {summary['failed']} |
| Skipped | ⏭️ {summary['skipped']} |
| Pass Rate | {'✅' if summary['pass_rate']>=95 else '⚠️'} {summary['pass_rate']:.1f}% |
| Duration | ⏱️ {summary['duration']:.0f}s |
| Date | {summary['date']} |

## Failed Tests
{failed_list if failed_list else '✅ No failures!'}

## Artifacts
- ✅ Excel Reports (Automation_Test_Report.xlsx + 3 more)
- ✅ HTML Reports (execution-report.html + dashboard.html)
- ✅ Screenshots (failure captures)
- ✅ JSON Results (execution-results.json)
"""
    with open('automation/reports/Summary/summary.md', 'w') as f:
        f.write(md)
