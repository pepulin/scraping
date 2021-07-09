const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.goto('https://aranjuez.i2a.es/CronosWeb/Login');
  // EMAIL
  await page.waitForSelector("#ContentSection_uLogin_txtIdentificador")
  await page.type("#ContentSection_uLogin_txtIdentificador", "pepulin@gmail.com")
  // PWD
  await page.waitForSelector("#ContentSection_uLogin_txtContrasena")
  await page.type("#ContentSection_uLogin_txtContrasena", "1992")
  // SUBMIT
  await page.click("#ContentSection_uLogin_btnEntrar");

  // Reserva de Eventos
  await page.waitForSelector('#ContentSection_uMenus_divMenus > ul > li:nth-child(3) > a > div.media-body > h4')
  const elem = await page.$eval("#ContentSection_uMenus_divMenus > ul > li:nth-child(3) > a > div.media-body > h4", el => el.textContent);
  console.log(elem)

  // Entro en reserva de eventos
  await page.click("#ContentSection_uMenus_divMenus > ul > li:nth-child(3) > a > div.media-body > h4");
  await page.waitForSelector('#collapseExample0 > div > div > div > ul > li:nth-child(2) > a > div > span')
  const spots = await page.$eval('#collapseExample0 > div > div > div > ul > li:nth-child(2) > a > div > span', el => el.textContent);
  console.log(spots)

  var re = /(\d+)\/100/g
  let free_spots = re.exec(spots)
  free_spots = parseInt(free_spots[1]);
  console.log(free_spots)

  if(free_spots > 0) {
    console.log('LIBRE!!')
  }

  await browser.close();
})();