const bodyParser = require('body-parser');
const fetch = require('node-fetch');

const express = require('express');
const path = require('path')
const PORT = process.env.PORT || 5000

const app = express();

app
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}))

app.get('/', (req, res) => res.sendFile(path.join(__dirname,'public/home.html')));

app.post('/getRate', async (req, res) => {

  const params = req.body;
  console.log(params);

  const distance = await getZipCodeDistance(params.from, params.to);
  const zone = identifyZone(distance);

  const rate = calculateRate(params.itemWeight, params.mailType, zone);
  res.render('pages/index', {rate});
});


app.listen(PORT, () => console.log(`Listening on ${ PORT }`));

async function getZipCodeDistance(z1, z2) {
  const url = `https://api.zip-codes.com/ZipCodesAPI.svc/1.0/CalculateDistance/ByZip?fromzipcode=${z1}&tozipcode=${z2}&key=DEMOAPIKEY`;

  const response = await fetch(url)
  const data = await response.json();

  console.log("Distance: "+data.DistanceInMiles);
  return data.DistanceInMiles;
}

function identifyZone(distance) {
  var zone = 0;
  
  if (distance <= 50) zone = 1;
  else if (distance <= 150) zone = 2;
  else if (distance <= 300) zone = 3;
  else if (distance <= 600) zone = 4;
  else if (distance <= 1000) zone = 5;
  else if (distance <= 1400) zone = 6;
  else if (distance <= 1800) zone = 7;
  else if (distance >= 1801) zone = 8;

  console.log("Zone: "+zone);
  return zone;
}

function calculateRate(weight, mailType, zone=null ) {

  var cost = 0;

  // Letters (Stamped)
  if(mailType == 1) {
    if(weight <= 1) cost = 0.55;
    else if(weight <= 2) cost = 0.75;
    else if(weight <= 3) cost = 0.95;
    else if(weight >= 3.01) cost = 1.15;
  } 
  
  // Letters (Metered)
  else if(mailType == 2) {
    if(weight <= 1) cost = 0.51;
    else if(weight <= 2) cost = 0.71;
    else if(weight <= 3) cost = 0.91;
    else if(weight >= 3.01) cost = 1.11;
  } 
  
  // Large Envelopes (Flats)
  else if(mailType == 3) {
    if(weight <= 1) cost = 1;
    else if(weight <= 2) cost = 1.20;
    else if(weight <= 3) cost = 1.40;
    else if(weight <= 4) cost = 1.60;
    else if(weight <= 5) cost = 1.80;
    else if(weight <= 6) cost = 2;
    else if(weight <= 7) cost = 2.20;
    else if(weight <= 8) cost = 2.40;
    else if(weight <= 9) cost = 2.60;
    else if(weight <= 10) cost = 2.80;
    else if(weight <= 11) cost = 3;
    else if(weight <= 12) cost = 3.20;
    else if(weight >= 12.01) cost = 3.40;
  } 

  // First-Class Package Service
  else if(mailType == 4) {
    switch (zone) {

      case 3:
        if(weight <= 1) cost = 4.10;
        else if(weight <= 2) cost = 4.10;
        else if(weight <= 3) cost = 4.10;
        else if(weight <= 4) cost = 4.10;
        else if(weight <= 5) cost = 4.85;
        else if(weight <= 6) cost = 4.85;
        else if(weight <= 7) cost = 4.85;
        else if(weight <= 8) cost = 4.85;
        else if(weight <= 9) cost = 5.55;
        else if(weight <= 10) cost = 5.55;
        else if(weight <= 11) cost = 5.55;
        else if(weight <= 12) cost = 5.55;
        else if(weight >= 12.01) cost = 6.30;
      break;

      case 4:
        if(weight <= 1) cost = 4.15;
        else if(weight <= 2) cost = 4.15;
        else if(weight <= 3) cost = 4.15;
        else if(weight <= 4) cost = 4.15;
        else if(weight <= 5) cost = 4.90;
        else if(weight <= 6) cost = 4.90;
        else if(weight <= 7) cost = 4.90;
        else if(weight <= 8) cost = 4.90;
        else if(weight <= 9) cost = 5.60;
        else if(weight <= 10) cost = 5.60;
        else if(weight <= 11) cost = 5.60;
        else if(weight <= 12) cost = 5.60;
        else if(weight >= 12.01) cost = 6.40;
      break;

      case 5:
        if(weight <= 1) cost = 4.20;
        else if(weight <= 2) cost = 4.20;
        else if(weight <= 3) cost = 4.20;
        else if(weight <= 4) cost = 4.20;
        else if(weight <= 5) cost = 4.95;
        else if(weight <= 6) cost = 4.95;
        else if(weight <= 7) cost = 4.95;
        else if(weight <= 8) cost = 4.95;
        else if(weight <= 9) cost = 5.65;
        else if(weight <= 10) cost = 5.65;
        else if(weight <= 11) cost = 5.65;
        else if(weight <= 12) cost = 5.65;
        else if(weight >= 12.01) cost = 6.50;
      break;

      case 6:
        if(weight <= 1) cost = 4.25;
        else if(weight <= 2) cost = 4.25;
        else if(weight <= 3) cost = 4.25;
        else if(weight <= 4) cost = 4.25;
        else if(weight <= 5) cost = 5;
        else if(weight <= 6) cost = 5;
        else if(weight <= 7) cost = 5;
        else if(weight <= 8) cost = 5;
        else if(weight <= 9) cost = 5.70;
        else if(weight <= 10) cost = 5.70;
        else if(weight <= 11) cost = 5.70;
        else if(weight <= 12) cost = 5.70;
        else if(weight >= 12.01) cost = 6.55;
      break;

      case 7:
        if(weight <= 1) cost = 4.30;
        else if(weight <= 2) cost = 4.30;
        else if(weight <= 3) cost = 4.30;
        else if(weight <= 4) cost = 4.30;
        else if(weight <= 5) cost = 5.10;
        else if(weight <= 6) cost = 5.10;
        else if(weight <= 7) cost = 5.10;
        else if(weight <= 8) cost = 5.10;
        else if(weight <= 9) cost = 5.85;
        else if(weight <= 10) cost = 5.85;
        else if(weight <= 11) cost = 5.85;
        else if(weight <= 12) cost = 5.85;
        else if(weight >= 12.01) cost = 6.65;
      break;

      case 8:
        if(weight <= 1) cost = 4.45;
        else if(weight <= 2) cost = 4.45;
        else if(weight <= 3) cost = 4.45;
        else if(weight <= 4) cost = 4.45;
        else if(weight <= 5) cost = 5.20;
        else if(weight <= 6) cost = 5.20;
        else if(weight <= 7) cost = 5.20;
        else if(weight <= 8) cost = 5.20;
        else if(weight <= 9) cost = 5.95;
        else if(weight <= 10) cost = 5.95;
        else if(weight <= 11) cost = 5.95;
        else if(weight <= 12) cost = 5.95;
        else if(weight >= 12.01) cost = 6.75;
      break;

      default:
        if(weight <= 1) cost = 4;
        else if(weight <= 2) cost = 4;
        else if(weight <= 3) cost = 4;
        else if(weight <= 4) cost = 4;
        else if(weight <= 5) cost = 4.80;
        else if(weight <= 6) cost = 4.80;
        else if(weight <= 7) cost = 4.80;
        else if(weight <= 8) cost = 4.80;
        else if(weight <= 9) cost = 5.50;
        else if(weight <= 10) cost = 5.50;
        else if(weight <= 11) cost = 5.50;
        else if(weight <= 12) cost = 5.50;
        else if(weight >= 12.01) cost = 6.25;
      break;
    }
  }

  console.log("Calculated cost for item with the weight of "+weight+" and mail type of "+mailType+" is: "+cost);
  return cost;
} 
