// IMPORT MODULES
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import * as path from 'path';
import { body, validationResult } from 'express-validator';

// IMPORT CUSTOM MODULES
import Customer from './modules/customers.js';
import Engagement from './modules/engagements.js';
import PaymentPlan from './modules/payment-plans.js';

dotenv.config();
const PORT = process.env.PORT || 5000;
const __dirname = process.cwd();
const app = express();

app
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs');

app.use(bodyParser.json());
app.use(cors());

// INITIALIZE CLASSES
const engagement = new Engagement();
const plans = new PaymentPlan();
const customer = new Customer();

// START API ENDPOINTS HERE ------>

app.get('/', (req, res) => res.sendFile(path.join(__dirname,'public/home.html')));


// CUSTOMERS API
app.post('/enroll-customer',
  body('first_name').not().isEmpty().trim().escape(),
  body('last_name').not().isEmpty().trim().escape(),
  body('email_address').isEmail(), 
  async (req, res) => {

  const data = req.body

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  customer.findCustomerByEmail(data.email_address, (response) => {
    console.log("checking email");
    console.log(response);
    console.log(response.length);

    if (response.length >= 1) {
      res.status(409).send({success: false, message: 'email address already exists'});
    }

    const account_status = 'Inactive';

    customer.enrollCustomer(data.first_name, data.last_name, data.email_address, account_status, (response) => {
      console.log(response);

      res.setHeader("Content-Type", "application/json");
      if(response.rowCount >= 1) {
        res.status(200).send({success: true, message: 'customer successfully created'});
        res.end();
      } else {
        res.status(500).send({success: false, message: 'an error occured while creating the customer'});
      }
    });
  });
});

// ENGAGEMENTS API
app.get('/list-engagements', async (req, res) => {

  engagement.listEngagements((response) => {
    console.log(response);

    res.setHeader("Content-Type", "application/json");
    res.send(response)
  });
});

// PAYMENT PLANS API
app.get('/list-plans', async (req, res) => {

  plans.listPlans((response) => {
    console.log(response);

    res.setHeader("Content-Type", "application/json");
    res.send(response)
  });
});

app.listen(PORT, () => console.log(`Listening on ${ PORT }`));
