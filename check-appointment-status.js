const { chromium } = require('playwright');
const fs = require('fs');
require('dotenv').config();

(async () => {
  const province = process.env.PROVINCE;
  const passportId = process.env.PASSPORT_ID;
  const name = process.env.NAME;
  const yearOfBirth = process.env.YEAR_OF_BIRTH;
  // const country = process.env.COUNTRY;

  const browser = await chromium.launch({
    headless: true,
    ignoreHTTPSErrors: true,
  });

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
  });

  const page = await context.newPage();

  // Start tracing
  await context.tracing.start({ screenshots: true, snapshots: true });

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err));

  try {
    await page.goto('https://icp.administracionelectronica.gob.es/icpplustieb/citar?p=8&locale=es', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });

    await page.waitForSelector('#divGrupoTramites');
    await page.selectOption('select[name="tramiteGrupo[0]"]', '4031');
    await page.click('#btnAceptar');

    await page.waitForSelector('#btnEntrar');
    await page.click('#btnEntrar');

    // Select passport as document type, and fill the form
    await page.click('#rdbTipoDocPas');
    await page.waitForSelector('#txtIdCitado', { state: 'visible' });
    await page.fill('#txtIdCitado', passportId);
    await page.waitForSelector('#txtDesCitado', { state: 'visible' });
    await page.fill('#txtDesCitado', name);
    await page.waitForSelector('#txtAnnoCitado', { state: 'visible' });
    await page.fill('#txtAnnoCitado', yearOfBirth);
    await page.selectOption('#txtPaisNac', '108');
    await page.click('#btnEnviar');

    // Check appointment status
    try {
      await page.waitForSelector('p.mf-msg__info', { state: 'visible' });
      const infoText = await page.$eval('p.mf-msg__info', el => el.textContent?.trim() || '');
      console.log('mf-msg__info paragraph found. Raw text:', infoText);
      if (infoText.includes('En este momento no hay citas disponibles')) {
        console.log('Appointment status: unavailable');
        console.log('Appointment status message:', infoText);
      } else {
        console.log('Appointment status: available');
        console.log('Appointment status message:', infoText);
      }
    } catch (err) {
      console.error('Error while checking appointment status:', err);
    }
  } catch (err) {
    console.error('Automation failed:', err);
    const html = await page.content();
    const url = page.url();

    console.error('Page URL at error:', url);
    console.error('Page content at error:');

    // Save HTML + Screenshot
    fs.writeFileSync('/tmp/nie-error-page.html', html);
    await page.screenshot({ path: '/tmp/nie-error-screenshot.png', fullPage: true });
  }

  // Save the trace
  await context.tracing.stop({ path: '/tmp/trace.zip' });

  await browser.close();
})();
