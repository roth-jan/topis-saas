const { chromium } = require('playwright');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const TUTORIAL_DIR = __dirname;
const SCREENSHOT_DIR = path.join(TUTORIAL_DIR, 'screenshots');

// Voiceover-Texte für jeden Schritt
const steps = [
  {
    name: '01-start',
    text: 'Willkommen bei TOPIS. Ich zeige dir jetzt wie du die Tor-Kalkulation verwendest.',
    action: async (page) => {
      await page.goto('http://localhost:3000', { timeout: 60000, waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(3000);
    }
  },
  {
    name: '02-halle',
    text: 'Das ist der Halleneditor. Links siehst du die Werkzeuge, in der Mitte die Halle, rechts die Eigenschaften.',
    action: async (page) => {
      await page.waitForTimeout(1000);
    }
  },
  {
    name: '03-szenarien',
    text: 'Lade jetzt Papas Testhalle über das Szenarien-Menü in der Toolbar.',
    action: async (page) => {
      // Klick auf Szenarien Dropdown
      const szenBtn = page.locator('button:has-text("Szenarien")').first();
      if (await szenBtn.count() > 0) {
        await szenBtn.click();
        await page.waitForTimeout(1000);
      }
    }
  },
  {
    name: '04-papa-halle',
    text: 'Wähle Papas Testhalle. Die Halle hat 10 Tore, Bereiche, und ein Hochregallager.',
    action: async (page) => {
      const papaItem = page.locator('text=Papa').first();
      if (await papaItem.count() > 0) {
        await papaItem.click();
        await page.waitForTimeout(2000);
      }
    }
  },
  {
    name: '05-halle-geladen',
    text: 'Die Testhalle ist geladen. Links die Eingangstore, rechts die Ausgangstore, in der Mitte die Bereiche.',
    action: async (page) => {
      // Klick irgendwo um Menü zu schließen
      await page.mouse.click(500, 500);
      await page.waitForTimeout(1000);
    }
  },
  {
    name: '06-kalkulation',
    text: 'Klicke jetzt auf Tor-Kalkulation um die Berechnung zu öffnen.',
    action: async (page) => {
      const kalkBtn = page.locator('button:has-text("Tor-Kalkulation")').first();
      if (await kalkBtn.count() > 0) {
        await kalkBtn.click();
        await page.waitForTimeout(1500);
      } else {
        // Versuche Calculator Icon
        const calcBtn = page.locator('button').filter({ has: page.locator('svg.lucide-calculator') }).first();
        if (await calcBtn.count() > 0) {
          await calcBtn.click();
          await page.waitForTimeout(1500);
        }
      }
    }
  },
  {
    name: '07-dialog',
    text: 'Hier siehst du alle Tore in einer Tabelle. Gib für jedes Tor die Paletten pro Tag ein.',
    action: async (page) => {
      await page.waitForTimeout(1000);
    }
  },
  {
    name: '08-eingabe',
    text: 'Trage die Werte ein: Paletten pro Tag, Entlade und Beladezeit. Wähle dann ein Ziel.',
    action: async (page) => {
      // Fülle erste Eingabe
      const inputs = page.locator('input[type="number"]');
      const count = await inputs.count();
      if (count > 0) {
        await inputs.first().fill('50');
      }
      await page.waitForTimeout(1000);
    }
  },
  {
    name: '09-ergebnis',
    text: 'Unten siehst du die Zusammenfassung. Gesamtpaletten, Fahrten, und die Zeit in Stunden pro Tag.',
    action: async (page) => {
      await page.waitForTimeout(1000);
    }
  },
  {
    name: '10-speichern',
    text: 'Klicke auf Speichern um die Daten zu sichern. Mit CSV Export kannst du alles für Excel herunterladen.',
    action: async (page) => {
      await page.waitForTimeout(1000);
    }
  },
  {
    name: '11-ende',
    text: 'Das wars! Probiere verschiedene Ziele aus um zu sehen welcher Weg schneller ist. Viel Erfolg!',
    action: async (page) => {
      await page.waitForTimeout(1000);
    }
  }
];

async function createScreenshots() {
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }

  console.log('Starte Browser...');
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox']
  });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();
  page.setDefaultTimeout(60000);

  console.log('Erstelle Screenshots...');

  for (const step of steps) {
    console.log(`  ${step.name}...`);
    try {
      await step.action(page);
    } catch (e) {
      console.log(`    Aktion fehlgeschlagen: ${e.message.split('\n')[0]}`);
    }

    try {
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, `${step.name}.png`),
        fullPage: false
      });
      console.log(`    ✓ Screenshot gespeichert`);
    } catch (e) {
      console.log(`    Screenshot fehlgeschlagen: ${e.message.split('\n')[0]}`);
    }
  }

  await browser.close();
  console.log('Screenshots fertig!\n');
}

function createVoiceover() {
  console.log('Erstelle Voiceover...');
  const audioDir = path.join(TUTORIAL_DIR, 'audio');
  if (!fs.existsSync(audioDir)) {
    fs.mkdirSync(audioDir, { recursive: true });
  }

  for (const step of steps) {
    console.log(`  ${step.name}...`);
    const audioFile = path.join(audioDir, `${step.name}.aiff`);
    try {
      execSync(`say -v Anna -o "${audioFile}" "${step.text}"`, { stdio: 'pipe' });
      console.log(`    ✓ Audio gespeichert`);
    } catch (e) {
      console.log(`    Audio fehlgeschlagen`);
    }
  }
  console.log('Voiceover fertig!\n');
}

function createVideo() {
  console.log('Erstelle Video...');

  const audioDir = path.join(TUTORIAL_DIR, 'audio');
  const outputFile = path.join(TUTORIAL_DIR, 'TOPIS-Tutorial.mp4');

  // Erstelle Slideshow mit passenden Dauern
  let inputArgs = '';
  let filterParts = [];
  let audioFilters = [];
  let videoConcat = '';
  let audioConcat = '';

  steps.forEach((step, i) => {
    const imgFile = path.join(SCREENSHOT_DIR, `${step.name}.png`);
    const audioFile = path.join(audioDir, `${step.name}.aiff`);

    if (!fs.existsSync(imgFile) || !fs.existsSync(audioFile)) {
      console.log(`  Überspringe ${step.name} (Dateien fehlen)`);
      return;
    }

    // Audio-Dauer ermitteln
    let duration = 5;
    try {
      const durStr = execSync(`ffprobe -v error -show_entries format=duration -of csv=p=0 "${audioFile}"`, { encoding: 'utf8' });
      duration = parseFloat(durStr) + 0.8;
    } catch (e) {}

    inputArgs += `-loop 1 -t ${duration} -i "${imgFile}" -i "${audioFile}" `;
    videoConcat += `[${i*2}:v]`;
    audioConcat += `[${i*2+1}:a]`;
  });

  const n = steps.length;
  const filterComplex = `${videoConcat}concat=n=${n}:v=1:a=0[v];${audioConcat}concat=n=${n}:v=0:a=1[a]`;

  const cmd = `ffmpeg -y ${inputArgs} -filter_complex "${filterComplex}" -map "[v]" -map "[a]" -c:v libx264 -preset fast -crf 23 -pix_fmt yuv420p -c:a aac -b:a 128k -shortest "${outputFile}"`;

  try {
    console.log('  Rendere Video...');
    execSync(cmd, { stdio: 'pipe', maxBuffer: 100 * 1024 * 1024 });
    console.log(`\n✅ Video erstellt: ${outputFile}`);
    return outputFile;
  } catch (e) {
    console.log('  Fehler beim Rendern, versuche einfache Methode...');
    return createSimpleVideo();
  }
}

function createSimpleVideo() {
  const audioDir = path.join(TUTORIAL_DIR, 'audio');
  const outputFile = path.join(TUTORIAL_DIR, 'TOPIS-Tutorial.mp4');

  // Kombiniere alle Audios
  const audioListFile = path.join(TUTORIAL_DIR, 'audiolist.txt');
  let audioList = '';
  steps.forEach(step => {
    const f = path.join(audioDir, `${step.name}.aiff`);
    if (fs.existsSync(f)) audioList += `file '${f}'\n`;
  });
  fs.writeFileSync(audioListFile, audioList);

  const combinedAudio = path.join(TUTORIAL_DIR, 'combined.m4a');
  execSync(`ffmpeg -y -f concat -safe 0 -i "${audioListFile}" -c:a aac "${combinedAudio}"`, { stdio: 'pipe' });

  // Erstelle Slideshow
  const imgListFile = path.join(TUTORIAL_DIR, 'imglist.txt');
  let imgList = '';
  steps.forEach(step => {
    const f = path.join(SCREENSHOT_DIR, `${step.name}.png`);
    if (fs.existsSync(f)) imgList += `file '${f}'\nduration 5\n`;
  });
  const lastImg = path.join(SCREENSHOT_DIR, `${steps[steps.length-1].name}.png`);
  if (fs.existsSync(lastImg)) imgList += `file '${lastImg}'\n`;
  fs.writeFileSync(imgListFile, imgList);

  execSync(`ffmpeg -y -f concat -safe 0 -i "${imgListFile}" -i "${combinedAudio}" -c:v libx264 -pix_fmt yuv420p -c:a copy -shortest "${outputFile}"`, { stdio: 'pipe' });

  console.log(`\n✅ Video erstellt: ${outputFile}`);
  return outputFile;
}

async function main() {
  console.log('=== TOPIS Tutorial Video Generator ===\n');

  try {
    await createScreenshots();
    createVoiceover();
    const videoFile = createVideo();

    if (videoFile && fs.existsSync(videoFile)) {
      console.log('\nÖffne Video...');
      execSync(`open "${videoFile}"`);
    }
  } catch (e) {
    console.error('\nFehler:', e.message);
  }
}

main();
