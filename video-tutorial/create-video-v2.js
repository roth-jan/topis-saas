const { chromium } = require('playwright');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const TUTORIAL_DIR = __dirname;
const SCREENSHOT_DIR = path.join(TUTORIAL_DIR, 'screenshots');
const AUDIO_DIR = path.join(TUTORIAL_DIR, 'audio');

// Bessere Stimme
const VOICE = 'Shelley';

// Voiceover-Texte - basierend auf Papas Zettel
const steps = [
  {
    name: '01-intro',
    text: 'Hallo Jürgen! Hier ist die Anleitung für TOPIS, basierend auf deinen Notizen. Ich zeige dir Schritt für Schritt wie du die Tor-Kalkulation verwendest.',
    url: 'http://localhost:3000'
  },
  {
    name: '02-oberflaeche',
    text: 'Das ist TOPIS. Links die Werkzeuge zum Zeichnen, in der Mitte die Halle, rechts die Eigenschaften. Oben die Toolbar mit allen Funktionen.',
    wait: 2000
  },
  {
    name: '03-szenarien',
    text: 'Zuerst laden wir deine Testhalle. Klicke auf Szenarien in der Toolbar.',
    click: 'button:has-text("Szenarien")'
  },
  {
    name: '04-papa-laden',
    text: 'Wähle Papas Testhalle. Das ist das Layout nach deiner Zeichnung mit den 10 Toren.',
    click: 'text=Papa'
  },
  {
    name: '05-halle-uebersicht',
    text: 'Hier ist deine Halle! Links siehst du die Eingangstore 1 bis 10. Rechts die Ausgangstore. In der Mitte die Bereiche 1 bis 4. Unten das Hochregallager, die Kommissionierung, und die Bereiche für Bleche und Stangen.',
    wait: 3000
  },
  {
    name: '06-kalkulation-oeffnen',
    text: 'Jetzt zu deinem Punkt 1: Tor-Daten eingeben. Klicke auf den Taschenrechner-Button für die Tor-Kalkulation.',
    click: 'button:has-text("Kalkulation")'
  },
  {
    name: '07-tabelle-erklaeren',
    text: 'Hier ist die Tabelle für alle Tore. Für jedes Tor gibst du ein: Eingang oder Ausgang, Paletten pro Tag, Entladezeit und Beladezeit pro Palette, und das Ziel wohin die Palette fährt.',
    wait: 2000
  },
  {
    name: '08-beispiel-eingabe',
    text: 'Beispiel: Tor 1 ist Eingang mit 50 Paletten am Tag. Entladezeit 30 Sekunden pro Palette. Das Ziel ist Bereich 1.',
    fill: { selector: 'input[type="number"]', value: '50' }
  },
  {
    name: '09-ziel-waehlen',
    text: 'Wähle das Ziel aus der Liste. Du kannst Bereiche, Stellplätze oder das Hochregal wählen.',
    wait: 2000
  },
  {
    name: '10-zusammenfassung',
    text: 'Unten siehst du die Tages-Zusammenfassung. Das ist dein Punkt 3: Alle Fahrten mal Zeit ergibt Stunden pro Tag. Hier werden Paletten, Fahrten, Entladezeit, Beladezeit und Fahrzeit addiert.',
    wait: 3000
  },
  {
    name: '11-vergleich-erklaeren',
    text: 'Jetzt zu deiner Frage: Ist es schneller wenn der Weg sich ändert? Ganz einfach: Ändere das Ziel von Bereich 1 auf Bereich 3 und schau ob die Zeit kleiner wird. So findest du den schnellsten Weg.',
    wait: 3000
  },
  {
    name: '12-hochregal',
    text: 'Für das Hochregal: Klicke auf ein Regal im Plan. Rechts siehst du die Ebenen, Höhe pro Ebene, und Einlagerungszeit. Je höher die Ebene, desto länger dauert es.',
    wait: 2000
  },
  {
    name: '13-stapeln',
    text: 'Für Bodenstellplätze: Du kannst die Stapelhöhe einstellen. 2-fach gestapelt verdoppelt die Kapazität. Das ist wichtig für die Platzberechnung.',
    wait: 2000
  },
  {
    name: '14-speichern',
    text: 'Klicke auf Speichern um die Eingaben zu sichern. Mit CSV Export lädst du alles für Excel herunter.',
    wait: 2000
  },
  {
    name: '15-ende',
    text: 'Das wars! Probiere verschiedene Ziele und Wege aus. Die Zeiten werden automatisch berechnet. Bei Fragen melde dich einfach. Viel Erfolg mit TOPIS!',
    wait: 2000
  }
];

async function createScreenshots() {
  console.log('Erstelle Screenshots...\n');

  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }

  const browser = await chromium.launch({ headless: false }); // Sichtbar für bessere Screenshots
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();

  // Erste Seite laden
  console.log('  Lade TOPIS...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    console.log(`  ${step.name}...`);

    // Aktion ausführen
    if (step.url && i > 0) {
      await page.goto(step.url, { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);
    }

    if (step.click) {
      try {
        await page.click(step.click, { timeout: 5000 });
        await page.waitForTimeout(1500);
      } catch (e) {
        console.log(`    (Klick übersprungen: ${step.click})`);
      }
    }

    if (step.fill) {
      try {
        const el = page.locator(step.fill.selector).first();
        if (await el.count() > 0) {
          await el.fill(step.fill.value);
          await page.waitForTimeout(500);
        }
      } catch (e) {}
    }

    if (step.wait) {
      await page.waitForTimeout(step.wait);
    }

    // Screenshot
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, `${step.name}.png`),
      fullPage: false
    });
    console.log(`    ✓ Screenshot`);
  }

  await browser.close();
  console.log('\nScreenshots fertig!\n');
}

function createVoiceover() {
  console.log('Erstelle Voiceover mit Stimme:', VOICE, '\n');

  if (!fs.existsSync(AUDIO_DIR)) {
    fs.mkdirSync(AUDIO_DIR, { recursive: true });
  }

  for (const step of steps) {
    console.log(`  ${step.name}...`);
    const audioFile = path.join(AUDIO_DIR, `${step.name}.aiff`);
    // Escapen von Anführungszeichen im Text
    const text = step.text.replace(/"/g, '\\"');
    execSync(`say -v "${VOICE}" -o "${audioFile}" "${text}"`, { stdio: 'pipe' });
    console.log(`    ✓ Audio`);
  }

  console.log('\nVoiceover fertig!\n');
}

function createVideo() {
  console.log('Erstelle Video...\n');

  const outputFile = path.join(TUTORIAL_DIR, 'TOPIS-Tutorial-fuer-Papa.mp4');

  // Prüfe welche Dateien existieren
  const validSteps = steps.filter(step => {
    const img = path.join(SCREENSHOT_DIR, `${step.name}.png`);
    const audio = path.join(AUDIO_DIR, `${step.name}.aiff`);
    return fs.existsSync(img) && fs.existsSync(audio);
  });

  if (validSteps.length === 0) {
    console.log('Keine Dateien gefunden!');
    return null;
  }

  console.log(`  ${validSteps.length} Schritte werden verarbeitet...`);

  // Einzelne Clips erstellen
  const clipFiles = [];
  for (let i = 0; i < validSteps.length; i++) {
    const step = validSteps[i];
    const img = path.join(SCREENSHOT_DIR, `${step.name}.png`);
    const audio = path.join(AUDIO_DIR, `${step.name}.aiff`);
    const clip = path.join(TUTORIAL_DIR, `clip_${i}.mp4`);

    // Audio-Dauer
    const durStr = execSync(`ffprobe -v error -show_entries format=duration -of csv=p=0 "${audio}"`, { encoding: 'utf8' });
    const duration = parseFloat(durStr) + 1.0; // 1 Sekunde Pause

    // Clip erstellen
    execSync(`ffmpeg -y -loop 1 -i "${img}" -i "${audio}" -c:v libx264 -t ${duration} -pix_fmt yuv420p -vf "scale=1920:1080" -c:a aac -b:a 192k -shortest "${clip}"`, { stdio: 'pipe' });

    clipFiles.push(clip);
    console.log(`    ✓ Clip ${i + 1}/${validSteps.length}`);
  }

  // Clips zusammenfügen
  const listFile = path.join(TUTORIAL_DIR, 'clips.txt');
  fs.writeFileSync(listFile, clipFiles.map(f => `file '${f}'`).join('\n'));

  console.log('  Füge Clips zusammen...');
  execSync(`ffmpeg -y -f concat -safe 0 -i "${listFile}" -c copy "${outputFile}"`, { stdio: 'pipe' });

  // Aufräumen
  clipFiles.forEach(f => fs.unlinkSync(f));
  fs.unlinkSync(listFile);

  console.log(`\n✅ Video erstellt: ${outputFile}`);

  // Dateigröße
  const stats = fs.statSync(outputFile);
  const sizeMB = (stats.size / 1024 / 1024).toFixed(1);
  console.log(`   Größe: ${sizeMB} MB`);

  // Dauer
  const dur = execSync(`ffprobe -v error -show_entries format=duration -of csv=p=0 "${outputFile}"`, { encoding: 'utf8' });
  console.log(`   Dauer: ${Math.round(parseFloat(dur))} Sekunden`);

  return outputFile;
}

async function main() {
  console.log('╔════════════════════════════════════════╗');
  console.log('║  TOPIS Tutorial Video für Papa         ║');
  console.log('╚════════════════════════════════════════╝\n');

  try {
    await createScreenshots();
    createVoiceover();
    const video = createVideo();

    if (video) {
      console.log('\nÖffne Video...');
      execSync(`open "${video}"`);
    }
  } catch (e) {
    console.error('\nFehler:', e.message);
  }
}

main();
