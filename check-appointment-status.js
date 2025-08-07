const { chromium } = require('playwright');
require('dotenv').config();

(async () => {
  const province = process.env.PROVINCE;
  const passportId = process.env.PASSPORT_ID;
  const name = process.env.NAME;
  const yearOfBirth = process.env.YEAR_OF_BIRTH;
  // const country = process.env.COUNTRY;

  // Set CI environment variable for Playwright
  process.env.CI = 'true';

  const browser = await chromium.launch({ headless: true, channel: 'chrome', ignoreHTTPSErrors: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
  });
  // Optionally use persistent context for more realism
  // const context = await chromium.launchPersistentContext('', {
  //   headless: true,
  //   channel: 'chrome',
  //   ignoreHTTPSErrors: true,
  //   userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
  // });
  const page = await context.newPage();
  try {
    await page.goto('https://sede.administracionespublicas.gob.es/pagina/index/directorio/icpplus', { waitUntil: 'networkidle' });

    // Click the submit button to proceed from the first page
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle', timeout: 30000 }),
      page.click('input#submit')
    ]);

    // Log page content after click for debugging
    console.log('Page content after submit:', await page.content());

    // Select your province
    await page.waitForSelector('#divProvincias', { timeout: 30000 });
    await page.selectOption('select#form', { label: province });
    await page.click('#btnAceptar');

    // Select POLICE-NIE ASSIGNMENT appointment
    await page.waitForSelector('#divGrupoTramites');
    await page.selectOption('select[name="tramiteGrupo[0]"]', '4031');
    await page.click('#btnAceptar');

    // Skip requirement page 
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
    console.error('Error during automation:', err);
    console.error('Page HTML for debugging:', await page.content());
  }

  await browser.close();
})();
