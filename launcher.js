const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  let only_one_time = false;
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
  
  // Comprobamos plazas libres a las 11
  await page.waitForSelector('#collapseExample0 > div > div > div > ul > li:nth-child(1) > a > div > span')
  let spots = await page.$eval('#collapseExample0 > div > div > div > ul > li:nth-child(1) > a > div > span', el => el.textContent);
  var re = /(\d+)\/100/g
  let free_spots_1 = re.exec(spots)
  let free_spots_2 = ""
  free_spots_1 = parseInt(free_spots_1[1]);

  // Comprobamos plazas libres a las 16 (Si no existe, es porque solo hay a las 16 ya.)
  try {
    spots = await page.$eval('#collapseExample0 > div > div > div > ul > li:nth-child(2) > a > div > span', el => el.textContent);
    var re = /(\d+)\/100/g
    free_spots_2 = re.exec(spots)
    free_spots_2 = parseInt(free_spots_2[1]);
  }
  catch (e) {
    only_one_time = true
  }
  
  if(only_one_time) {
    console.log("11:00  ->  NO DISPONIBLE.");
    console.log("16:00  ->  " + free_spots_1 + " Libres")
  }
  else {
    console.log("11:00  ->  " + free_spots_1 + " Libres")
    console.log("16:00  ->  " + free_spots_2 + " Libres")
  }

  // Controller
  if(free_spots_1 > 0) {
    console.log('LIBRE!!')
  }

  await browser.close();
})();