import os
import json
from datetime import datetime
from automation.config.config import config

class HTMLReporter:
    def __init__(self, results: list, summary: dict):
        self.results = results
        self.summary = summary
        os.makedirs(os.path.join(config.REPORT_DIR, 'HTML'), exist_ok=True)
        os.makedirs(os.path.join(config.REPORT_DIR, 'JSON'), exist_ok=True)

    def generate_all(self):
        self._generate_json()
        self._generate_execution_report()
        self._generate_dashboard()

    def _generate_json(self):
        data = {'summary': self.summary, 'results': self.results, 'generated': datetime.now().isoformat()}
        path = os.path.join(config.REPORT_DIR, 'JSON', 'execution-results.json')
        with open(path, 'w') as f:
            json.dump(data, f, indent=2, default=str)

    def _row_color(self, status):
        return {'PASSED': '#0d2e0d', 'FAILED': '#2e0d0d', 'SKIPPED': '#2e2a0d'}.get(status.upper(), '#0d1117')

    def _badge(self, status):
        colors = {'PASSED':'#3fb950','FAILED':'#f85149','SKIPPED':'#e3b341','BLOCKED':'#8b949e'}
        c = colors.get(status.upper(), '#8b949e')
        return f'<span style="background:{c};color:#fff;padding:2px 8px;border-radius:4px;font-size:.75rem;font-weight:700">{status}</span>'

    def _generate_execution_report(self):
        s = self.summary
        rows = ''.join(f'''
        <tr style="background:{self._row_color(t.get('status',''))}">
            <td style="font-family:monospace;font-size:.8rem">{t.get('id','')}</td>
            <td>{t.get('module','')}</td>
            <td style="max-width:400px">{t.get('name','')}</td>
            <td>{self._badge(t.get('status',''))}</td>
            <td>{t.get('priority','Medium')}</td>
            <td>{round(t.get('duration',0),2)}s</td>
            <td style="max-width:300px;font-size:.75rem;color:#e3b341">{(t.get('error') or '')[:120]}</td>
        </tr>''' for t in self.results)

        html = f'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>RoadSense AI – E2E Execution Report</title>
<style>
*{{box-sizing:border-box;margin:0;padding:0}}
body{{font-family:'Segoe UI',Arial,sans-serif;background:#0d1117;color:#c9d1d9;padding:24px}}
h1{{color:#58a6ff;font-size:1.7rem;margin-bottom:6px}}
.meta{{color:#8b949e;font-size:.85rem;margin-bottom:20px}}
.metrics{{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin-bottom:24px}}
.card{{background:#161b22;border:1px solid #30363d;border-radius:8px;padding:16px;text-align:center}}
.card .num{{font-size:2rem;font-weight:900}}
.card .lbl{{font-size:.75rem;color:#8b949e;margin-top:4px}}
.pass{{color:#3fb950}}.fail{{color:#f85149}}.skip{{color:#e3b341}}
table{{width:100%;border-collapse:collapse;font-size:.82rem}}
th{{background:#1f6feb;color:#fff;padding:8px 10px;text-align:left}}
td{{padding:7px 10px;border-bottom:1px solid #21262d;vertical-align:top}}
tr:hover td{{background:#1c2128}}
.search{{width:100%;padding:8px 12px;background:#161b22;border:1px solid #30363d;
           border-radius:6px;color:#c9d1d9;margin-bottom:14px;font-size:.9rem}}
</style>
</head>
<body>
<h1>🚦 RoadSense AI – Live E2E Execution Report</h1>
<div class="meta">
  Base URL: <strong>{config.BASE_URL}</strong> &nbsp;|&nbsp;
  Date: <strong>{s.get('date','')}</strong>
</div>
<div class="metrics">
  <div class="card"><div class="num">{s.get('total',0)}</div><div class="lbl">Total Tests</div></div>
  <div class="card"><div class="num pass">{s.get('passed',0)}</div><div class="lbl">Passed</div></div>
  <div class="card"><div class="num fail">{s.get('failed',0)}</div><div class="lbl">Failed</div></div>
  <div class="card"><div class="num skip">{s.get('skipped',0)}</div><div class="lbl">Skipped</div></div>
  <div class="card"><div class="num {'pass' if s.get('pass_rate',0)>=95 else 'fail'}">{s.get('pass_rate',0):.1f}%</div><div class="lbl">Pass Rate</div></div>
  <div class="card"><div class="num">{s.get('duration',0):.0f}s</div><div class="lbl">Duration</div></div>
</div>
<input class="search" type="text" id="searchBox" onkeyup="filterTable()" placeholder="🔍 Search test cases...">
<table id="testTable">
<thead><tr><th>Test ID</th><th>Module</th><th>Test Name</th><th>Status</th><th>Priority</th><th>Duration</th><th>Error</th></tr></thead>
<tbody>{rows}</tbody>
</table>
<script>
function filterTable() {{
  const q = document.getElementById('searchBox').value.toLowerCase();
  document.querySelectorAll('#testTable tbody tr').forEach(r => {{
    r.style.display = r.textContent.toLowerCase().includes(q) ? '' : 'none';
  }});
}}
</script>
</body></html>'''
        path = os.path.join(config.REPORT_DIR, 'HTML', 'execution-report.html')
        with open(path, 'w', encoding='utf-8') as f:
            f.write(html)

    def _generate_dashboard(self):
        s = self.summary
        modules = {}
        for t in self.results:
            m = t.get('module', 'Unknown')
            if m not in modules:
                modules[m] = {'passed': 0, 'failed': 0, 'total': 0}
            modules[m]['total'] += 1
            if t.get('status', '').upper() == 'PASSED':
                modules[m]['passed'] += 1
            elif t.get('status', '').upper() == 'FAILED':
                modules[m]['failed'] += 1

        module_rows = ''.join(f'''
        <tr>
          <td>{m}</td>
          <td>{d['total']}</td>
          <td style="color:#3fb950">{d['passed']}</td>
          <td style="color:#f85149">{d['failed']}</td>
          <td>{(d['passed']/d['total']*100):.0f}%</td>
        </tr>''' for m, d in sorted(modules.items()))

        failed_rows = ''.join(f'''
        <tr>
          <td style="font-family:monospace">{t.get('id','')}</td>
          <td>{t.get('name','')}</td>
          <td>{t.get('module','')}</td>
          <td style="color:#e3b341">{(t.get('error') or 'See screenshot')[:100]}</td>
        </tr>''' for t in self.results if t.get('status','').upper() == 'FAILED')

        html = f'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>RoadSense AI – Test Dashboard</title>
<style>
*{{box-sizing:border-box;margin:0;padding:0}}
body{{font-family:'Segoe UI',sans-serif;background:#0d1117;color:#c9d1d9;padding:28px}}
h1{{color:#58a6ff;font-size:1.8rem;margin-bottom:6px}}
.sub{{color:#8b949e;margin-bottom:22px;font-size:.9rem}}
.grid{{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:14px;margin-bottom:28px}}
.card{{background:#161b22;border:1px solid #30363d;border-radius:10px;padding:20px;text-align:center}}
.card .big{{font-size:2.2rem;font-weight:900;margin-bottom:4px}}
.card .label{{font-size:.78rem;color:#8b949e}}
.green{{color:#3fb950}}.red{{color:#f85149}}.yellow{{color:#e3b341}}.blue{{color:#58a6ff}}
.section{{margin-bottom:28px}}
.section h2{{color:#58a6ff;font-size:1rem;border-bottom:1px solid #21262d;padding-bottom:8px;margin-bottom:12px}}
table{{width:100%;border-collapse:collapse;font-size:.82rem}}
th{{background:#21262d;color:#8b949e;padding:8px 10px;text-align:left;font-size:.78rem;text-transform:uppercase}}
td{{padding:8px 10px;border-bottom:1px solid #21262d}}
.bar-bg{{background:#21262d;border-radius:4px;height:8px;margin-top:6px}}
.bar{{background:#3fb950;height:8px;border-radius:4px}}
</style>
</head>
<body>
<h1>📊 RoadSense AI – Test Execution Dashboard</h1>
<div class="sub">Live GitHub Pages E2E | {s.get('date','')} | <a href="{config.BASE_URL}" style="color:#58a6ff">{config.BASE_URL}</a></div>

<div class="grid">
  <div class="card"><div class="big blue">{s.get('total',0)}</div><div class="label">Total Tests</div></div>
  <div class="card"><div class="big green">{s.get('passed',0)}</div><div class="label">✅ Passed</div></div>
  <div class="card"><div class="big red">{s.get('failed',0)}</div><div class="label">❌ Failed</div></div>
  <div class="card"><div class="big yellow">{s.get('skipped',0)}</div><div class="label">⏭️ Skipped</div></div>
  <div class="card">
    <div class="big {'green' if s.get('pass_rate',0)>=95 else 'red'}">{s.get('pass_rate',0):.1f}%</div>
    <div class="label">Pass Rate</div>
    <div class="bar-bg"><div class="bar" style="width:{min(s.get('pass_rate',0),100):.0f}%"></div></div>
  </div>
  <div class="card"><div class="big">{s.get('duration',0):.0f}s</div><div class="label">⏱️ Duration</div></div>
</div>

<div class="section">
  <h2>📦 Results by Module</h2>
  <table>
    <thead><tr><th>Module</th><th>Total</th><th>Passed</th><th>Failed</th><th>Pass Rate</th></tr></thead>
    <tbody>{module_rows}</tbody>
  </table>
</div>

<div class="section">
  <h2>❌ Failed Test Cases</h2>
  <table>
    <thead><tr><th>Test ID</th><th>Test Name</th><th>Module</th><th>Failure Reason</th></tr></thead>
    <tbody>{'<tr><td colspan="4" style="color:#3fb950;text-align:center">✅ No failures!</td></tr>' if not failed_rows else failed_rows}</tbody>
  </table>
</div>
</body></html>'''
        path = os.path.join(config.REPORT_DIR, 'HTML', 'dashboard.html')
        with open(path, 'w', encoding='utf-8') as f:
            f.write(html)
