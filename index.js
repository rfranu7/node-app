require('dotenv').config();
const { Pool } = require('pg');

const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const cors = require('cors');

const express = require('express');
const path = require('path');
const PORT = process.env.PORT || 5000;

const app = express();

app
  .use(express.static(path.join(__dirname, 'public')));
  .set('views', path.join(__dirname, 'views'));
  .set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(cors());

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({
  connectionString: connectionString,
  ssl: { rejectUnauthorized: false }
});



app.get('/', (req, res) => res.sendFile(path.join(__dirname,'public/home.html')));

app.get('/list-engagements', async (req, res) => {

  dbConnect("SELECT * FROM engagements", (response) => {
    console.log("inside callback function");
    console.log(response);

    res.setHeader("Content-Type", "application/json");
    res.send(response)
  });

  
});


app.listen(PORT, () => console.log(`Listening on ${ PORT }`));


async function dbConnect(sql, callback) {
  pool.connect((err, client, done) => {
    if (err) throw err
    client.query(sql, (err, response) => {
      done()
      if (err) {
        console.log(err.stack)
      } else {
        console.log("logging from callback")
        console.log(response.rows)
        callback(response.rows);
      }
    })
  })
}
