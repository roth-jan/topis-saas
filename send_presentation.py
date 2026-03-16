#!/usr/bin/env python3
"""TOPIS SaaS — Präsentation per Microsoft Graph API senden."""

import base64
import json
import os
import requests

# Graph API Credentials
TENANT_ID = "adca3f20-9482-43b7-a710-bedb66b625ff"
CLIENT_ID = "814a500a-1873-48c6-903b-38341a75cb8a"
CLIENT_SECRET = "jTy8Q~QRZevuG_s-cvh8uo6FDWoYTxyfPN.fKcZZ"
SENDER = "jhroth@ntconsult.de"
RECIPIENT = "jhroth@ntconsult.de"

# Screenshots
SCREENSHOT_DIR = os.path.join(os.path.dirname(__file__), "public", "screenshots")
SCREENSHOTS = [
    ("01-editor-halle.png", "Hallenplan-Editor (AS Halle 6, 85 Tore)"),
    ("02-heatmap-betriebsdaten.png", "Betriebsdaten-Heatmap (Sendungen/Tor)"),
    ("03-prozessmodell.png", "Prozessmodell SE (Min/Colli-Berechnung)"),
    ("04-benchmark.png", "Benchmarking (vs. 8 Referenzhallen)"),
    ("05-dashboard.png", "KPI-Dashboard"),
]

def get_token():
    url = f"https://login.microsoftonline.com/{TENANT_ID}/oauth2/v2.0/token"
    data = {
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
        "scope": "https://graph.microsoft.com/.default",
        "grant_type": "client_credentials",
    }
    r = requests.post(url, data=data)
    r.raise_for_status()
    return r.json()["access_token"]

def build_html():
    html = """
<html>
<head>
<style>
body { font-family: 'Segoe UI', Arial, sans-serif; background: #0a0a0a; color: #e0e0e0; max-width: 900px; margin: 0 auto; padding: 20px; }
h1 { color: #ef4444; border-bottom: 2px solid #ef4444; padding-bottom: 10px; }
h2 { color: #3b82f6; margin-top: 30px; }
.badge { display: inline-block; background: #1e3a5f; color: #60a5fa; padding: 3px 10px; border-radius: 12px; font-size: 12px; margin-right: 6px; }
.kpi { display: inline-block; background: #1a1a2e; border: 1px solid #333; border-radius: 8px; padding: 12px 20px; margin: 5px; text-align: center; }
.kpi .val { font-size: 28px; font-weight: bold; color: #ef4444; }
.kpi .label { font-size: 11px; color: #888; text-transform: uppercase; }
.screenshot { border: 1px solid #333; border-radius: 8px; margin: 15px 0; width: 100%; }
.feature { background: #111827; border-left: 3px solid #3b82f6; padding: 10px 15px; margin: 8px 0; border-radius: 0 6px 6px 0; }
a { color: #60a5fa; }
.phase { background: #0f172a; border: 1px solid #1e293b; border-radius: 8px; padding: 15px; margin: 10px 0; }
.phase h3 { color: #f59e0b; margin: 0 0 8px 0; }
</style>
</head>
<body>

<h1>TOPIS SaaS — Grosser Umbau abgeschlossen</h1>

<p>TOPIS ist jetzt ein <strong>vollstaendiges Beratungstool</strong> statt nur ein Zeichentool.</p>
<p>
<span class="badge">5 Phasen</span>
<span class="badge">21 neue Dateien</span>
<span class="badge">11 geaenderte Dateien</span>
<span class="badge">Alle Builds OK</span>
</p>

<div style="text-align: center; margin: 20px 0;">
<div class="kpi"><div class="val">3.217</div><div class="label">Min / Colli</div></div>
<div class="kpi"><div class="val">16</div><div class="label">Colli / MA-Std</div></div>
<div class="kpi"><div class="val">114.0</div><div class="label">FTE-Bedarf</div></div>
<div class="kpi"><div class="val">138.8 m</div><div class="label">Verteilweg</div></div>
</div>

<h2>Phase 1: CSV-Import + Tor-Zuordnung</h2>
<div class="feature">4-Schritt-Wizard: CSV hochladen → Tor-Zuordnung → Relations-Zuordnung → Import</div>
<div class="feature">8 vorkonfigurierte Kunden-Formate (AS, Geis, PML, IDS, Noerpel, Rhenus, TLT)</div>
<div class="feature">Matching-Fix: stellplatz-basiert statt fuzzy Name-Match</div>

<h2>Phase 2: Prozessmodell-Engine</h2>
<div class="feature">Min/Colli-Berechnung mit 29 Prozessschritten (4 Abteilungen)</div>
<div class="feature">16 konfigurierbare Parameter (Geschwindigkeit, Wege, Zeiten)</div>
<div class="feature">Layout-abhaengige Verteiler-Schritte (Weg aus Pathfinding)</div>
<img src="cid:03-prozessmodell.png" class="screenshot" alt="Prozessmodell"/>

<h2>Phase 3: Verteilweg + Flaechenbedarf</h2>
<div class="feature">Gewichteter Verteilweg: Colli-gewichtete Durchschnittswege je Tor</div>
<div class="feature">Flaechenbedarfsrechnung: Colli/Tag / 1.25 = qm je Relation</div>
<img src="cid:02-heatmap-betriebsdaten.png" class="screenshot" alt="Heatmap"/>

<h2>Phase 4: Benchmarking + IST-SOLL</h2>
<div class="feature">8 Referenzhallen (AS, Geis, Rhenus, Noerpel, IDS, PML, TLT, Hellmann)</div>
<div class="feature">Ranking pro Abteilung + Einsparpotential in MA-Stunden/Tag</div>
<div class="feature">IST-SOLL-Analyse: stuendliche Produktivitaet (SOLL vs. IST MA)</div>
<img src="cid:04-benchmark.png" class="screenshot" alt="Benchmark"/>

<h2>Phase 5: KPI-Dashboard</h2>
<div class="feature">4 KPI-Karten: Min/Colli, Produktivitaet, FTE, Verteilweg</div>
<div class="feature">Canvas 2D Charts: Stundenprofil, Abteilungs-Breakdown, Benchmark-Radar</div>
<div class="feature">Flaechenbedarf-Tabelle + Tor-Detail</div>
<img src="cid:05-dashboard.png" class="screenshot" alt="Dashboard"/>

<h2>Editor mit Halle 6</h2>
<img src="cid:01-editor-halle.png" class="screenshot" alt="Editor"/>

<hr style="border-color: #333; margin: 30px 0;"/>
<p style="color: #666; font-size: 12px;">
Live: <a href="https://roth-jan.github.io/topis-saas/">roth-jan.github.io/topis-saas</a> |
Repo: <a href="https://github.com/roth-jan/topis-saas">github.com/roth-jan/topis-saas</a><br/>
Generiert mit Claude Code (Opus 4.6) — 15.03.2026
</p>

</body>
</html>
"""
    return html

def send_mail(token):
    # Build attachments
    attachments = []
    for filename, desc in SCREENSHOTS:
        filepath = os.path.join(SCREENSHOT_DIR, filename)
        with open(filepath, "rb") as f:
            content = base64.b64encode(f.read()).decode()
        attachments.append({
            "@odata.type": "#microsoft.graph.fileAttachment",
            "name": filename,
            "contentType": "image/png",
            "contentBytes": content,
            "contentId": filename,
            "isInline": True,
        })

    message = {
        "message": {
            "subject": "TOPIS SaaS — Grosser Umbau abgeschlossen (5 Phasen, 21 neue Dateien)",
            "body": {
                "contentType": "HTML",
                "content": build_html(),
            },
            "toRecipients": [
                {"emailAddress": {"address": RECIPIENT}}
            ],
            "attachments": attachments,
        },
        "saveToSentItems": True,
    }

    url = f"https://graph.microsoft.com/v1.0/users/{SENDER}/sendMail"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }
    r = requests.post(url, headers=headers, json=message)
    print(f"Status: {r.status_code}")
    if r.status_code == 202:
        print("Mail erfolgreich gesendet!")
    else:
        print(f"Fehler: {r.text}")
    return r.status_code

if __name__ == "__main__":
    print("Token holen...")
    token = get_token()
    print("Mail senden...")
    status = send_mail(token)
