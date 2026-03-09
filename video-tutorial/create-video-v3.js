const { chromium } = require('playwright');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const TUTORIAL_DIR = __dirname;
const SCREENSHOT_DIR = path.join(TUTORIAL_DIR, 'screenshots');
const AUDIO_DIR = path.join(TUTORIAL_DIR, 'audio');

// Microsoft KI-Stimme
const VOICE = 'de-DE-KatjaNeural';

// Alle Schritte basierend auf Papas Zettel
const steps = [
  {
    name: '01-intro',
    text: 'Hallo Jürgen! Hier ist die Anleitung für TOPIS, basierend auf deinen Notizen vom 30. Januar. Ich zeige dir Schritt für Schritt, wie du die Tor-Kalkulation verwendest.'
  },
  {
    name: '02-oberflaeche',
    text: 'Das ist TOPIS. Links siehst du die Werkzeuge zum Zeichnen. In der Mitte ist die Halle. Rechts werden die Eigenschaften angezeigt. Oben findest du die Toolbar mit allen Funktionen.'
  },
  {
    name: '03-szenarien',
    text: 'Zuerst laden wir deine Testhalle. Klicke dazu auf Szenarien in der Toolbar oben.'
  },
  {
    name: '04-papa-laden',
    text: 'Wähle jetzt Papas Testhalle aus der Liste. Das ist das Layout nach deiner Zeichnung mit allen 10 Toren.'
  },
  {
    name: '05-halle-uebersicht',
    text: 'Hier ist deine Halle! Links sind 8 Eingangstore, rechts 2 Ausgangstore - insgesamt 10 Tore. In der Mitte befinden sich die Bereiche 1 bis 4. Unten findest du das Hochregallager, die Kommissionierung, sowie die Bereiche für Bleche und Stangen.'
  },
  {
    name: '06-kalkulation-oeffnen',
    text: 'Jetzt zu deinem ersten Punkt: Tor-Daten eingeben. Klicke auf den Taschenrechner-Button in der Toolbar. Das öffnet die Tor-Kalkulation.'
  },
  {
    name: '07-tabelle-erklaeren',
    text: 'Hier ist die Tabelle für alle Tore. Für jedes Tor kannst du eingeben: Ob es ein Eingang oder Ausgang ist, wie viele Paletten pro Tag, die Entladezeit und Beladezeit pro Palette, und das Ziel, wohin die Palette transportiert wird.'
  },
  {
    name: '08-beispiel-eingabe',
    text: 'Ein Beispiel: Tor 1 ist ein Eingang mit 50 Paletten am Tag. Die Entladezeit beträgt 30 Sekunden pro Palette. Als Ziel wählen wir Bereich 1.'
  },
  {
    name: '09-ziel-waehlen',
    text: 'Das Ziel wählst du aus der Dropdown-Liste. Du kannst Bereiche, Stellplätze oder das Hochregal als Ziel angeben.'
  },
  {
    name: '10-zusammenfassung',
    text: 'Unten siehst du die Tages-Zusammenfassung. Das entspricht deinem Punkt 3: Alle Fahrten mal Zeit ergibt Stunden pro Tag. Hier werden Paletten, Fahrten, Entladezeit, Beladezeit und Fahrzeit automatisch addiert.'
  },
  {
    name: '11-vergleich-erklaeren',
    text: 'Jetzt zu deiner wichtigen Frage: Ist es schneller, wenn der Weg sich ändert? Ganz einfach: Ändere das Ziel von Bereich 1 auf Bereich 3 und vergleiche die Zeiten. So findest du den schnellsten Weg für jedes Tor.'
  },
  {
    name: '12-hochregal',
    text: 'Für das Hochregal: Klicke auf ein Regal im Hallenplan. Rechts siehst du dann die Anzahl der Ebenen, die Höhe pro Ebene, und die Einlagerungszeit. Je höher die Ebene, desto länger dauert die Einlagerung.'
  },
  {
    name: '13-stapeln',
    text: 'Bei Bodenstellplätzen kannst du die Stapelhöhe einstellen. Zweifach gestapelt verdoppelt die Kapazität. Das ist wichtig für die Platzberechnung, die du angefragt hast.'
  },
  {
    name: '14-speichern',
    text: 'Vergiss nicht zu speichern! Klicke auf den Speichern-Button um deine Eingaben zu sichern. Mit CSV Export kannst du alle Daten für Excel herunterladen.'
  },
  {
    name: '15-ende',
    text: 'Das wars auch schon! Probiere verschiedene Ziele und Wege aus. Die Zeiten werden immer automatisch berechnet. Bei Fragen melde dich einfach bei mir. Viel Erfolg mit TOPIS!'
  }
];

async function createScreenshots() {
  console.log('\n📸 Erstelle Screenshots...\n');

  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();

  console.log('  Lade TOPIS Editor...');
  try {
    // Direkt zum Editor navigieren (Route ist /projekt)
    await page.goto('http://localhost:3000/projekt', { waitUntil: 'networkidle', timeout: 30000 });
  } catch (e) {
    await page.goto('http://localhost:3000/projekt', { waitUntil: 'domcontentloaded', timeout: 30000 });
  }
  await page.waitForTimeout(3000);

  // Screenshot-Aktionen für jeden Schritt
  const actions = {
    '01-intro': async () => { /* Startseite */ },
    '02-oberflaeche': async () => { await page.waitForTimeout(1000); },
    '03-szenarien': async () => {
      const btn = page.locator('button:has-text("Szenarien")').first();
      if (await btn.count() > 0) await btn.click();
      await page.waitForTimeout(1000);
    },
    '04-papa-laden': async () => {
      const item = page.locator('div[role="menuitem"]:has-text("Papa")').first();
      if (await item.count() > 0) await item.click();
      await page.waitForTimeout(2000);
    },
    '05-halle-uebersicht': async () => {
      await page.mouse.click(600, 400);
      await page.waitForTimeout(1000);
    },
    '06-kalkulation-oeffnen': async () => {
      const btn = page.locator('button:has-text("Kalkulation")').first();
      if (await btn.count() > 0) await btn.click();
      await page.waitForTimeout(1500);
    },
    '07-tabelle-erklaeren': async () => { await page.waitForTimeout(500); },
    '08-beispiel-eingabe': async () => {
      const inputs = page.locator('table input[type="number"]');
      if (await inputs.count() > 0) {
        await inputs.first().fill('50');
      }
      await page.waitForTimeout(500);
    },
    '09-ziel-waehlen': async () => {
      const select = page.locator('button:has-text("Wählen")').first();
      if (await select.count() > 0) await select.click();
      await page.waitForTimeout(800);
    },
    '10-zusammenfassung': async () => {
      await page.mouse.click(500, 500);
      await page.waitForTimeout(500);
    },
    '11-vergleich-erklaeren': async () => { await page.waitForTimeout(500); },
    '12-hochregal': async () => {
      // Dialog schließen
      const closeBtn = page.locator('button:has-text("Abbrechen")').first();
      if (await closeBtn.count() > 0) await closeBtn.click();
      await page.waitForTimeout(500);
      // Klick auf Hochregal im Plan
      await page.mouse.click(200, 500);
      await page.waitForTimeout(1000);
    },
    '13-stapeln': async () => {
      await page.mouse.click(150, 300);
      await page.waitForTimeout(1000);
    },
    '14-speichern': async () => {
      // Kalkulation wieder öffnen
      const btn = page.locator('button:has-text("Kalkulation")').first();
      if (await btn.count() > 0) await btn.click();
      await page.waitForTimeout(1000);
    },
    '15-ende': async () => { await page.waitForTimeout(500); }
  };

  for (const step of steps) {
    console.log(`  ${step.name}...`);

    try {
      if (actions[step.name]) {
        await actions[step.name]();
      }
    } catch (e) {
      console.log(`    ⚠ Aktion übersprungen`);
    }

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, `${step.name}.png`),
      fullPage: false
    });
    console.log(`    ✓`);
  }

  await browser.close();
  console.log('\n✅ Screenshots fertig!\n');
}

async function createVoiceover() {
  console.log('🎙️  Erstelle Voiceover mit Katja...\n');

  if (!fs.existsSync(AUDIO_DIR)) {
    fs.mkdirSync(AUDIO_DIR, { recursive: true });
  }

  for (const step of steps) {
    console.log(`  ${step.name}...`);
    const audioFile = path.join(AUDIO_DIR, `${step.name}.mp3`);
    const text = step.text.replace(/"/g, '\\"');

    try {
      execSync(`pipx run edge-tts --voice "${VOICE}" --text "${text}" --write-media "${audioFile}"`,
        { stdio: 'pipe', timeout: 30000 });
      console.log(`    ✓`);
    } catch (e) {
      console.log(`    ✗ Fehler`);
    }
  }

  console.log('\n✅ Voiceover fertig!\n');
}

function createVideo() {
  console.log('🎬 Erstelle Video...\n');

  const outputFile = path.join(TUTORIAL_DIR, 'TOPIS-Tutorial-fuer-Papa.mp4');

  // Clips erstellen
  const clipFiles = [];

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    const img = path.join(SCREENSHOT_DIR, `${step.name}.png`);
    const audio = path.join(AUDIO_DIR, `${step.name}.mp3`);
    const clip = path.join(TUTORIAL_DIR, `temp_clip_${i}.mp4`);

    if (!fs.existsSync(img) || !fs.existsSync(audio)) {
      console.log(`  ⚠ Überspringe ${step.name} (Dateien fehlen)`);
      continue;
    }

    // Audio-Dauer + 1.5s Pause
    let duration = 5;
    try {
      const dur = execSync(`ffprobe -v error -show_entries format=duration -of csv=p=0 "${audio}"`, { encoding: 'utf8' });
      duration = parseFloat(dur) + 1.5;
    } catch (e) {}

    console.log(`  ${step.name} (${duration.toFixed(1)}s)...`);

    try {
      execSync(`ffmpeg -y -loop 1 -i "${img}" -i "${audio}" -c:v libx264 -t ${duration} -pix_fmt yuv420p -vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2" -c:a aac -b:a 192k -ar 44100 -shortest "${clip}"`,
        { stdio: 'pipe' });
      clipFiles.push(clip);
      console.log(`    ✓`);
    } catch (e) {
      console.log(`    ✗ Fehler beim Rendern`);
    }
  }

  if (clipFiles.length === 0) {
    console.log('❌ Keine Clips erstellt!');
    return null;
  }

  // Clips zusammenfügen
  console.log('\n  Füge Clips zusammen...');
  const listFile = path.join(TUTORIAL_DIR, 'cliplist.txt');
  fs.writeFileSync(listFile, clipFiles.map(f => `file '${f}'`).join('\n'));

  try {
    execSync(`ffmpeg -y -f concat -safe 0 -i "${listFile}" -c copy "${outputFile}"`, { stdio: 'pipe' });
  } catch (e) {
    // Fallback: Re-encode
    execSync(`ffmpeg -y -f concat -safe 0 -i "${listFile}" -c:v libx264 -c:a aac "${outputFile}"`, { stdio: 'pipe' });
  }

  // Aufräumen
  clipFiles.forEach(f => { try { fs.unlinkSync(f); } catch(e) {} });
  try { fs.unlinkSync(listFile); } catch(e) {}

  // Info
  const stats = fs.statSync(outputFile);
  const sizeMB = (stats.size / 1024 / 1024).toFixed(1);
  const dur = execSync(`ffprobe -v error -show_entries format=duration -of csv=p=0 "${outputFile}"`, { encoding: 'utf8' });
  const minutes = Math.floor(parseFloat(dur) / 60);
  const seconds = Math.round(parseFloat(dur) % 60);

  console.log(`\n╔════════════════════════════════════════╗`);
  console.log(`║  ✅ Video erstellt!                     ║`);
  console.log(`╠════════════════════════════════════════╣`);
  console.log(`║  📁 ${sizeMB} MB                            `);
  console.log(`║  ⏱️  ${minutes}:${seconds.toString().padStart(2, '0')} Minuten                      `);
  console.log(`║  🎙️  Stimme: Katja                       `);
  console.log(`╚════════════════════════════════════════╝`);

  return outputFile;
}

async function main() {
  console.log('╔════════════════════════════════════════╗');
  console.log('║  TOPIS Tutorial für Jürgen             ║');
  console.log('║  Mit KI-Stimme "Katja"                 ║');
  console.log('╚════════════════════════════════════════╝');

  try {
    await createScreenshots();
    await createVoiceover();
    const video = createVideo();

    if (video && fs.existsSync(video)) {
      console.log('\n🎬 Öffne Video...\n');
      execSync(`open "${video}"`);
    }
  } catch (e) {
    console.error('\n❌ Fehler:', e.message);
  }
}

main();
