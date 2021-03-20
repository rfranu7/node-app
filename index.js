// IMPORT MODULES
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import * as path from 'path';
import { body, param, validationResult } from 'express-validator';
import bcrypt from 'bcrypt';

// IMPORT CUSTOM MODULES
import Customer from './modules/customers.js';
import Engagement from './modules/engagements.js';
import PaymentPlan from './modules/payment-plans.js';
import Invoice from './modules/invoice.js';

dotenv.config();
const saltRounds = 10;
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
const customer = new Customer();
const engagement = new Engagement();
const invoice = new Invoice();
const plans = new PaymentPlan();

// START API ENDPOINTS HERE ------>

app.get('/', (req, res) => res.sendFile(path.join(__dirname,'public/home.html')));


/*************************************************
* CUSTOMERS API 
*************************************************/
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

  customer.checkDuplicateEmail(data.email_address, (response) => {
    console.log("checking email");
    console.log(response);
    console.log(response.length);

    if (response.length >= 1) {
      return res.status(409).send({success: false, message: 'email address already exists'});
    }
    
    const account_status = 'Inactive';

    customer.enrollCustomer(data.first_name, data.last_name, data.email_address, account_status, (response) => {
      console.log(response);

      res.setHeader("Content-Type", "application/json");
      if(response.rowCount >= 1) {
        return res.status(200).send({success: true, message: 'customer successfully created'});
      } else {
        return res.status(500).send({success: false, message: 'an error occured while creating the customer'});
      }
    });
  });
});

app.post('/add-customer-engagement',
  body('customer_id').isInt(),
  body('engagement_id').isInt(),
  async (req, res) => {

  const data = req.body

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  customer.addEngagement(data.customer_id, data.engagement_id, (response) => {
    console.log(response);

      res.setHeader("Content-Type", "application/json");
      if(response.rowCount >= 1) {
        return res.status(200).send({success: true, message: 'engagement successfully added to customer'});
      } else {
        return res.status(500).send({success: false, message: 'an error occured while adding the engagement to the customer'});
      }
  });

});

// UPDATE
app.post('/set-customer-password',
  body('email_address').isEmail(),
  body('password').isLength({ min: 6 }),
  body('password_confirmation').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Password confirmation does not match password');
    }
    return true;
  }),
  async (req, res) => {

  const data = req.body

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return res.status(400).json({ errors: errors.array() });
  }

  customer.findCustomerByEmail(data.email_address, (response) => {
    console.log("checking email");
    const customerData = response[0];

    if(customerData.account_status == "Inactive") {
      console.log("update password");

      // HASH PASSWORD
      const hash = hashpassword(data.password, saltRounds);
      customer.updateCustomerPassword(customerData.customer_id, hash, (response) => {
        console.log(response);
  
        res.setHeader("Content-Type", "application/json");
        if(response.rowCount >= 1) {
          return res.status(200).send({success: true, message: 'password successfully updated'});
        } else {
          return res.status(500).send({success: false, message: 'an error occured while updating the password'});
        }
      });

    } else {
      return res.status(403).send({success: false, message: 'password was already updated'});
    }
  });
});

app.post('/update-customer',
  body('email_address').optional(),
  body('first_name').escape().optional(),
  body('last_name').escape().optional(),
  body('birthday').optional(),
  body('account_status').escape().optional(),
  body('id').isInt(),
  async (req, res) => {

  const data = req.body
  console.log(data);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return res.status(400).json({ errors: errors.array() });
  }

  customer.findCustomerById(data.id, async (response) => {
    console.log(response);
    const customerData = response[0];
    const updateData = {
      id: data.id,
    };
    
    if(data.email_address) {
      updateData.email_address = data.email_address;
    } else {
      updateData.email_address = customerData.email_address;
    }

    if(data.first_name) {
      updateData.first_name = data.first_name;
    } else {
      updateData.first_name = customerData.first_name;
    }

    if(data.last_name) {
      updateData.last_name = data.last_name;
    } else {
      updateData.last_name = customerData.last_name;
    }

    if(data.birthday) {
      updateData.birthday = data.birthday;
    } else {
      const date = new Date(customerData.birthday)
      updateData.birthday = date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate();
    }

    if(data.account_status) {
      updateData.account_status = data.account_status;
    } else {
      updateData.account_status = customerData.account_status;
    }

    console.log("udpated data");
    console.log(updateData);

    if(data.email_address) {
      customer.checkDuplicateEmailOnUpdate(data.email_address, data.id, (response) => {
        console.log(response);

        if (!response == "undefined" && response.length >= 1) {
          return res.status(409).send({success: false, message: 'email address already exists'});
        }

        customer.updateCustomer(updateData.id, updateData.first_name, updateData.last_name, updateData.email_address, updateData.birthday, updateData.account_status, (response) => {
          console.log(response);
  
          res.setHeader("Content-Type", "application/json");
          if(response.rowCount >= 1) {
            return res.status(200).send({success: true, message: 'customer details successfully updated'});
          } else {
            return res.status(500).send({success: false, message: 'an error occured while updating the customer details'});
          }
        });
      });
    } else {
      customer.updateCustomer(updateData.id, updateData.first_name, updateData.last_name, updateData.email_address, updateData.birthday, updateData.account_status, (response) => {
        console.log(response);

        res.setHeader("Content-Type", "application/json");
        if(response.rowCount >= 1) {
          return res.status(200).send({success: true, message: 'customer details successfully updated'});
        } else {
          return res.status(500).send({success: false, message: 'an error occured while updating the customer details'});
        }
      });
    }
  });
});

// GET
app.get('/list-customers', async (req, res) => {

  customer.listCustomers((response) => {
    console.log(response);

    res.setHeader("Content-Type", "application/json");
    res.send(response)
  });
});

/*************************************************
* ENGAGEMENTS API 
*************************************************/
app.get('/add-engagement', async (req, res) => {

  engagement.addEngagement((response) => {
    console.log(response);

    res.setHeader("Content-Type", "application/json");
    res.send(response)
  });
});

app.get('/list-engagements', async (req, res) => {

  engagement.listEngagements((response) => {
    console.log(response);

    res.setHeader("Content-Type", "application/json");
    res.send(response)
  });
});

/*************************************************
* PAYMENT PLANS API 
*************************************************/
app.get('/list-plans', async (req, res) => {

  plans.listPlans((response) => {
    console.log(response);

    res.setHeader("Content-Type", "application/json");
    res.send(response)
  });
});

/*************************************************
* INVOICES API 
*************************************************/
app.get('/list-invoices', async (req, res) => {
  
  const params = console.log(req.query);

  invoice.listInvoices((response) => {
    console.log(response);

    res.setHeader("Content-Type", "application/json");
    res.send(response)
  },params.start, params.end, params.status, params.customer, params.engagement);
});

app.listen(PORT, () => console.log(`Listening on ${ PORT }`));

function hashpassword(password, salt){
  return bcrypt.hashSync(password, salt);
}

function checkPassword(password, hash){
  return bcrypt.compareSync(password, hash);
}
