-- SCRIPT FOR SETTING UP DATABASE

-- CUSTOMERS TABLE SETUP
CREATE TABLE customers (
    customer_id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email_address VARCHAR(100) UNIQUE NOT NULL,
    customer_password VARCHAR(255) NOT NULL,
    birthday DATE NOT NULL,
    account_status VARCHAR(100) NOT NULL DEFAULT 'Active'
);

CREATE TABLE engagements (
    engagement_id SERIAL PRIMARY KEY,
    engagement_name VARCHAR(150) NOT NULL,
    duration INT NOT NULL,
    total_fee NUMERIC(10,2) NOT NULL
);

CREATE TABLE payment_plans (
    plan_id SERIAL PRIMARY KEY,
    plan_name VARCHAR(150) NOT NULL,
    plan_terms INT NOT NULL
);

CREATE TABLE invoices (
    invoice_id SERIAL PRIMARY KEY,
    invoice_number VARCHAR(150) NOT NULL,
    customer_id INT REFERENCES customers(customer_id) NOT NULL,
    engagement_id INT REFERENCES engagements(engagement_id) NOT NULL,
    due_date DATE NOT NULL,
    sub_total NUMERIC(10,2) NOT NULL,
    price_adjustments NUMERIC(10,2) NOT NULL,
    total_amount NUMERIC(10,2) NOT NULL,
    invoice_status VARCHAR(100) NOT NULL DEFAULT 'Open',
    notes TEXT NULL DEFAULT NULL
);

CREATE TABLE invoice_items (
    item_id SERIAL PRIMARY KEY,
    invoice_id INT REFERENCES invoices(invoice_id) NOT NULL,
    item_description TEXT NOT NULL,
    item_amount NUMERIC(10,2) NOT NULL
);

CREATE TABLE customer_engagement (
    id SERIAL PRIMARY KEY,
    customer_id INT REFERENCES customers(customer_id) NOT NULL,
    engagement_id INT REFERENCES engagements(engagement_id) NOT NULL
);

CREATE TABLE engagement_terms (
    id SERIAL PRIMARY KEY,
    engagement_id INT REFERENCES engagements(engagement_id) NOT NULL,
    plan_id INT REFERENCES payment_plans(plan_id) NOT NULL
);

-- DEFAULT INSERT STATEMENTS

INSERT INTO payment_plans (plan_name, plan_terms) VALUES
('Bi-Weekly', 24), ('Monthly', 12), ('Quarterly', 4), ('Semi-Annual', 2), ('Annual', 1);

INSERT INTO engagements (engagement_name, duration, total_fee) VALUES
('Clarity Series', 3, 12500), ('BTM', 12, 24000);