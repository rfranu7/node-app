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

app.use(bodyParser.urlencoded({extended: true}));
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
  body('email_address').custom(value => {
    return customer.findCustomerByEmail(value).then(customer => {
      if (customer) {
        return Promise.reject('E-mail already in use');
      }
    });
  }),
  async (req, res) => {
  const data = req.body;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const account_status = 'Inactive';

  customer.enrollCustomer(req.first_name, req.last_name, req.email_address, account_status, (response) => {
    console.log(response);

    res.setHeader("Content-Type", "application/json");
    res.send(response)
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
