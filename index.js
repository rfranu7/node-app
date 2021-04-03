// IMPORT MODULES
import dotenv from 'dotenv';
import cors from 'cors';
import express from 'express';
import * as path from 'path';
import { body, validationResult } from 'express-validator';
import session from 'express-session';
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

app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(session({
	secret: 'secret-keyboard',
	resave: true,
	saveUninitialized: true
}));
app.use(cors());

// INITIALIZE CLASSES
const customer = new Customer();
const engagement = new Engagement();
const invoice = new Invoice();
const plans = new PaymentPlan();

// START API ENDPOINTS HERE ------>

/*************************************************
* FRONTEND ENDPOINTS
*************************************************/

app.get('/', (req, res) => { 
  
  if (req.session.loggedin) {
    res.redirect('/coachees');
	} else {
    res.redirect('/login');
	}
	res.end();
});

app.get('/login', (req, res) => {
  res.render('pages/login', {message: null});
});

app.get('/coachees', verifyLogin, (req, res) => {
  customer.listCustomers((response) => {
    console.log(response);

    res.render('pages/coachee', {customers: response});
  });
});

app.get('/programs', verifyLogin, (req, res) => {
  engagement.listEngagements((response) => {
    console.log(response);

    res.render('pages/programs', {programs: response});
  });
});

app.get('/program/:id', verifyLogin, (req, res) => {
  const data = req.params;
  engagement.getEngagement(data.id, (response) => {
    console.log(response[0]);

    res.render('pages/program', {program: response[0]});
  });
});

app.get('/invoices', verifyLogin, (req, res) => {
  invoice.listInvoices((response) => {
    console.log(response);

    res.render('pages/invoices', {invoices: response});
  });
});

app.get('/invoices/:id', verifyLogin, (req, res) => {
  const data = req.params;
  invoice.getInvoice(data.id, (response) => {
    console.log(response[0]);

    res.render('pages/invoice', {invoice: response[0]});
  });
});

app.get('/payment-plans', verifyLogin, (req, res) => {
  plans.listPlans((response) => {
    console.log(response);

    res.render('pages/plans', {plans: response});
  });
});

app.get('/dash', (req, res) => res.sendFile(path.join(__dirname,'public/dashboard.html')));
app.get('/test', (req, res) => res.sendFile(path.join(__dirname,'public/home.html')));


/*************************************************
* CUSTOMERS API 
*************************************************/
app.post('/enroll-customer',
  body('first_name').not().isEmpty().trim().escape(),
  body('last_name').not().isEmpty().trim().escape(),
  body('email_address').isEmail(),
  verifyLogin,
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
  verifyLogin,
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
  verifyLogin,
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
app.get('/list-customers', verifyLogin, async (req, res) => {

  customer.listCustomers((response) => {
    console.log(response);

    res.setHeader("Content-Type", "application/json");
    res.send(response)
  });
});

app.get('/get-customer', verifyLogin, async (req, res) => {
  const data = req.query;

  console.log(data);

  customer.findCustomerById(data.id, (response) => {
    console.log(response[0]);

    res.setHeader("Content-Type", "application/json");
    return res.status(200).send({success: true, customer: response[0]});
  });
})

// LOGIN
app.post('/auth',
  body('email_address').isEmail(),
  body('password').isLength({ min: 6 }),
  async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(errors);
      return res.status(400).json({ errors: errors.array() });
    }

    const data = req.body;

    if(data.email_address && data.password) {
      customer.findCustomerByEmail(data.email_address, (response) => {
        console.log(response);
        if(response.length >= 1) {

          const verify = checkPassword(data.password, response[0].customer_password);
          if(verify) {
            delete response[0].customer_password;
            console.log(response);

            req.session.loggedin = true;
            req.session.user = response[0];
            res.redirect('/');
          } else {
            res.render('pages/login', {message: 'Email address and password provided is invalid'});
          }
        }
      });
    }

});

// LOGOUT
app.get('/logout', verifyLogin, async (req, res) => {

  if(req.session.user){
      req.session.destroy();
      res.redirect('/login');
  }
  else{
    res.redirect('/');
  }

});

/*************************************************
* ENGAGEMENTS API 
*************************************************/
app.post('/add-engagement',
body('engagement_name').not().isEmpty().trim().escape(),
body('duration').isInt(),
body('total_fee').isNumeric(),
verifyLogin, async (req, res) => {

  const data = req.body
  console.log(data);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return res.status(400).json({ errors: errors.array() });
  }

  engagement.addEngagement(data.engagement_name, data.duration, data.total_fee,(response) => {
    console.log(response);

    res.setHeader("Content-Type", "application/json");
    if(response.rowCount >= 1) {
      return res.status(200).send({success: true, message: 'program successfully created'});
    } else {
      return res.status(500).send({success: false, message: 'an error occured while creating the program'});
    }
  });
});

app.post('/add-engagement-plan',
  body('engagement_id').isInt(),
  body('plan_id').isInt(),
  verifyLogin,
  async (req, res) => {

  const data = req.body

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  engagement.addPaymentTerms(data.engagement_id, data.plan_id, (response) => {
    console.log(response);

      res.setHeader("Content-Type", "application/json");
      if(response.rowCount >= 1) {
        return res.status(200).send({success: true, message: 'payment term successfully added to program'});
      } else {
        return res.status(500).send({success: false, message: 'an error occured while adding the payment term to the program'});
      }
  });

});

app.post('/update-engagement',
  body('engagement_name').optional(),
  body('duration').escape().optional(),
  body('total_fee').escape().optional(),
  body('id').isInt(),
  verifyLogin,
  async (req, res) => {

  const data = req.body
  console.log(data);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return res.status(400).json({ errors: errors.array() });
  }

  engagement.getEngagement(data.id, async (response) => {
    console.log(response);
    const engagementData = response[0];
    const updateData = {
      id: data.id,
    };
    
    if(data.engagement_name) {
      updateData.engagement_name = data.engagement_name;
    } else {
      updateData.engagement_name = engagementData.engagement_name;
    }

    if(data.duration) {
      updateData.duration = data.duration;
    } else {
      updateData.duration = engagementData.duration;
    }

    if(data.total_fee) {
      updateData.total_fee = data.total_fee;
    } else {
      updateData.total_fee = engagementData.total_fee;
    }

    console.log("udpated data");
    console.log(updateData);

    engagement.updateEngagement(updateData.id, updateData.engagement_name, updateData.duration, updateData.total_fee, (response) => {
      console.log(response);

      res.setHeader("Content-Type", "application/json");
      if(response.rowCount >= 1) {
        return res.status(200).send({success: true, message: 'program details successfully updated'});
      } else {
        return res.status(500).send({success: false, message: 'an error occured while updating the program details'});
      }
    });
  });
});

app.get('/list-engagements', verifyLogin, async (req, res) => {

  engagement.listEngagements((response) => {
    console.log(response);

    res.setHeader("Content-Type", "application/json");
    res.send(response)
  });
});

app.get('/get-engagement', verifyLogin, async (req, res) => {
  const data = req.query;

  engagement.getEngagement(data.id, (response) => {
    console.log(response[0]);

    res.setHeader("Content-Type", "application/json");
    return res.status(200).send({success: true, engagement: response[0]});
  });
})

/*************************************************
* PAYMENT PLANS API 
*************************************************/
app.post('/add-plan',
body('plan_name').not().isEmpty().trim().escape(),
body('plan_terms').isInt(),
verifyLogin, async (req, res) => {

  const data = req.body
  console.log(data);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return res.status(400).json({ errors: errors.array() });
  }

  plans.addPlan(data.plan_name, data.plan_terms,(response) => {
    console.log(response);

    res.setHeader("Content-Type", "application/json");
    if(response.rowCount >= 1) {
      return res.status(200).send({success: true, message: 'Payment term successfully created'});
    } else {
      return res.status(500).send({success: false, message: 'an error occured while creating the payment term'});
    }
  });
});

app.post('/update-plan',
  body('plan_name').optional(),
  body('plan_terms').escape().optional(),
  body('id').isInt(),
  verifyLogin,
  async (req, res) => {

  const data = req.body
  console.log(data);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return res.status(400).json({ errors: errors.array() });
  }

  plans.getPlan(data.id, async (response) => {
    console.log(response);
    const planData = response[0];
    const updateData = {
      id: data.id,
    };
    
    if(data.plan_name) {
      updateData.plan_name = data.plan_name;
    } else {
      updateData.plan_name = planData.plan_name;
    }

    if(data.plan_terms) {
      updateData.plan_terms = data.plan_terms;
    } else {
      updateData.plan_terms = planData.plan_terms;
    }

    console.log("udpated data");
    console.log(updateData);

    plans.updatePlan(updateData.id, updateData.plan_name, updateData.plan_terms, (response) => {
      console.log(response);

      res.setHeader("Content-Type", "application/json");
      if(response.rowCount >= 1) {
        return res.status(200).send({success: true, message: 'payment terms successfully updated'});
      } else {
        return res.status(500).send({success: false, message: 'an error occured while updating the payment terms'});
      }
    });
  });
});

app.get('/list-plans', verifyLogin,  async (req, res) => {

  plans.listPlans((response) => {
    console.log(response);

    res.setHeader("Content-Type", "application/json");
    res.send(response)
  });
});

app.get('/get-plan', verifyLogin, async (req, res) => {
  const data = req.query;

  plans.getPlan(data.id, (response) => {
    console.log(response[0]);

    res.setHeader("Content-Type", "application/json");
    return res.status(200).send({success: true, plan: response[0]});
  });
})

/*************************************************
* INVOICES API 
*************************************************/
app.post('/add-invoice',
  body('customer_id').isInt(),
  body('engagement_id').isInt(),
  body('due_date').isDate(),
  body('notes').not().isEmpty().trim().escape(),
  verifyLogin,
  async (req, res) => {

  const data = req.body

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const invoice_number = Date.now().toString();

  invoice.addInvoice(invoice_number, data.customer_id, data.engagement_id, data.due_date, data.notes, (response) => {
    console.log(response);

    res.setHeader("Content-Type", "application/json");
    if(response.rowCount >= 1) {
      return res.status(200).send({success: true, message: 'Invoice successfully created', invoice_id: response.rows[0].invoice_id, invoice_number: response.rows[0].invoice_number});
    } else {
      return res.status(500).send({success: false, message: 'an error occured while creating the invoice'});
    }
  });
});

app.post('/add-invoice-item',
  body('invoice_id').isInt(),
  body('item_description').isInt(),
  body('item_amount').isDate(),
  verifyLogin,
  async (req, res) => {

  const data = req.body

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  invoice.addInvoiceItems(data.invoice_id, data.item_description, data.item_amount, (response) => {
    console.log(response);

    res.setHeader("Content-Type", "application/json");
    if(response.rowCount >= 1) {
      return res.status(200).send({success: true, message: 'Invoice item successfully added'});
    } else {
      return res.status(500).send({success: false, message: 'an error occured while creating the invoice item'});
    }
  });
});

app.post('/update-invoice',
  body('customer_id').optional(),
  body('engagement_id').optional(),
  body('due_date').optional(),
  body('sub_total').optional(),
  body('price_adjustments').optional(),
  body('total_amount').optional(),
  body('invoice_status').escape().optional(),
  body('notes').escape().optional(),
  body('id').isInt(),
  verifyLogin,
  async (req, res) => {

  const data = req.body
  console.log(data);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return res.status(400).json({ errors: errors.array() });
  }

  invoice.getInvoice(data.id, async (response) => {
    console.log(response);
    const invoiceData = response[0];
    const updateData = {
      id: data.id,
    };
    
    if(data.customer_id) {
      updateData.customer_id = data.customer_id;
    } else {
      updateData.customer_id = invoiceData.customer_id;
    }

    if(data.engagement_id) {
      updateData.engagement_id = data.engagement_id;
    } else {
      updateData.engagement_id = invoiceData.engagement_id;
    }

    if(data.due_date) {
      updateData.due_date = data.due_date;
    } else {
      const date = new Date(invoiceData.due_date)
      updateData.due_date = date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate();
    }

    if(data.sub_total) {
      updateData.sub_total = data.sub_total;
    } else {
      updateData.sub_total = invoiceData.sub_total;
    }

    if(data.price_adjustments) {
      updateData.price_adjustments = data.price_adjustments;
    } else {
      updateData.price_adjustments = invoiceData.price_adjustments;
    }

    if(data.total_amount) {
      updateData.total_amount = data.total_amount;
    } else {
      updateData.total_amount = invoiceData.total_amount;
    }

    if(data.invoice_status) {
      updateData.invoice_status = data.invoice_status;
    } else {
      updateData.invoice_status = invoiceData.invoice_status;
    }

    if(data.notes) {
      updateData.notes = data.notes;
    } else {
      updateData.notes = invoiceData.notes;
    }

    console.log("udpated data");
    console.log(updateData);

    invoice.updateInvoice(updateData.id, updateData.customer_id, updateData.engagement_id, updateData.due_date, updateData.sub_total, updateData.price_adjustments, updateData.total_amount, updateData.invoice_status, updateData.notes, (response) => {
      console.log(response);

      res.setHeader("Content-Type", "application/json");
      if(response.rowCount >= 1) {
        return res.status(200).send({success: true, message: 'invoice details successfully updated'});
      } else {
        return res.status(500).send({success: false, message: 'an error occured while updating the invoice details'});
      }
    });
  });
});

app.post('/update-invoice-status',
  body('invoice_status').escape().optional(),
  body('id').isInt(),
  verifyLogin,
  async (req, res) => {

  const data = req.body
  console.log(data);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return res.status(400).json({ errors: errors.array() });
  }

  invoice.updateInvoiceStatus(updateData.id, data.invoice_status, (response) => {
    console.log(response);

    res.setHeader("Content-Type", "application/json");
    if(response.rowCount >= 1) {
      return res.status(200).send({success: true, message: 'invoice status successfully updated'});
    } else {
      return res.status(500).send({success: false, message: 'an error occured while updating the invoice status'});
    }
  });
});

app.get('/list-invoices', verifyLogin,  async (req, res) => {
  
  const params = req.query;
  console.log(params);

  const filters = {};

  if(params.start) {
    filters.start = params.start;
  } else {
    filters.start = null;
  }

  if(params.end) {
    filters.end = params.end;
  } else {
    filters.end = null;
  }

  if(params.status) {
    filters.status = params.status;
  } else {
    filters.status = null;
  }

  if(params.customer) {
    filters.customer = params.customer;
  } else {
    filters.customer = null;
  }

  if(params.engagement) {
    filters.engagement = params.engagement;
  } else {
    filters.engagement = null;
  }

  invoice.listInvoices((response) => {
    console.log(response);

    res.setHeader("Content-Type", "application/json");
    res.send(response)
  }, filters.start, filters.end, filters.status, filters.customer, filters.engagement);
});

app.get('/get-invoice', verifyLogin, async (req, res) => {
  const data = req.query;

  invoice.getInvoice(data.id, (response) => {
    console.log(response[0]);

    res.setHeader("Content-Type", "application/json");
    return res.status(200).send({success: true, invoice: response[0]});
  });
})



/*************************************************
* APP LISTEN
*************************************************/
app.listen(PORT, () => console.log(`Listening on ${ PORT }`));


/*************************************************
* HELPER FUNCTIONS API 
*************************************************/

function hashpassword(password, salt){
  return bcrypt.hashSync(password, salt);
}

function checkPassword(password, hash){
  return bcrypt.compareSync(password, hash);
}

function verifyLogin(request, response, next) {
	if (request.session.user) {
		next();
	} else {
		response.redirect('/');
	}
}
