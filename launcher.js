require('dotenv').config()
const puppeteer = require('puppeteer');
var AWS = require('aws-sdk');
// Set the region 
AWS.config.update({
    region: 'us-east-1',
});

(async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  let only_one_time = false;
  const page = await browser.newPage();
  let today = new Date(Date.now());
  let day_str = today.toLocaleDateString('en-EN', { weekday: 'long' });
  let day = today.getDate();
  let month = today.getMonth() + 1;
  let year = today.getFullYear();
  let today_str = day + "/" + month + "/" + year;

  if(day_str == 'Monday' || day_str == 'Wednesday' || day_str == 'Friday') {
    console.log(today + '  -->  Not executing.')
    process.exit()
  }
  
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
  console.log(today + '  -->  ' + elem)

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
    //NO QUEREMOS RESERVA REALMENTE...YA SON LAS 15:00 O MAS
  }
  else {
    console.log("11:00  ->  " + free_spots_1 + " Libres")
    console.log("16:00  ->  " + free_spots_2 + " Libres")
    // Hay sitio a las 4???
    if(free_spots_2 > 0) {
      // READ RESERVED TICKETS FOR TODAY
      var ddb = new AWS.DynamoDB({apiVersion: '2012-08-10'});
      var params = {
        TableName: 'scraping',
        Key: {
          'fecha': {S: today_str}
        },
        ProjectionExpression: 'entradas'
      };
      var reserved = 0;
      
      let result=ddb.getItem(params, function(err, data) {
        if (err) {
          console.log("Error", err);
        } else {
          //console.log("Success", data.Item);
          if(data.Item != undefined) {
            reserved = data.Item['entradas']['N']
            console.log("Entradas reservadas: " + reserved)
          }
        }
      });
      await result.promise()
      if(parseInt(reserved) < 2) {
        // Reserve new tickets
        await page.click("#collapseExample0 > div > div > div > ul > li:nth-child(2) > a > div > span");
        await page.waitForSelector('#ContentSection_uAltaEventos_uAltaEventosZonas_ddlEntradas')
        await page.click("#ContentSection_uAltaEventos_uAltaEventosZonas_Celda_1_25_25");
        await page.waitForSelector('#divContenedorCarritoConfirmar > h2 > span')
        await page.click("#ContentSection_lnkConfirmar");
        reserved=parseInt(reserved) + 1;
        var params = {
          TableName: 'scraping',
          Item: {
            'fecha' : {S: today_str},
            'entradas' : {N: reserved.toString()}
          }
        };
        // Call DynamoDB to add the item to the table
        ddb.putItem(params, function(err, data) {
          if (err) {
            console.log("Error", err);
          } else {
            console.log("Success", data);
            console.log('Reservada una entrada!!!')
          }
        });
      }
    } 
  }

  await browser.close();
})();