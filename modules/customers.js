import { dbRead, dbWrite } from "./utilities.js";
const tableName = 'customers';

export default class Customer {

    // INSERT
    async enrollCustomer(first_name, last_name, email_address, account_status, callback) {
        var sql = `INSERT INTO ${tableName} (first_name, last_name, email_address, account_status) VALUES ('${first_name}', '${last_name}', '${email_address}', '${account_status}')`;
        console.log(sql);
        dbWrite(sql, callback);
    }

    async addEngagement(customer_id, engagement_id, callback) {
        var sql = `INSERT INTO customer_engagement (customer_id, engagement_id) VALUES ('${customer_id}', '${engagement_id}')`;
        console.log(sql);
        dbWrite(sql, callback);
    }

    // UPDATE
    async updateCustomerPassword(customer_id, customer_password, callback) {
        var sql = `UPDATE ${tableName} SET customer_password = '${customer_password}', account_status = 'Active' WHERE customer_id = ${customer_id}`;
        console.log(sql);
        dbWrite(sql, callback);
    }

    async updateCustomer(customer_id, first_name, last_name, email_address, birthday, account_status, callback) {

        var sql = `UPDATE ${tableName} SET first_name = '${first_name}', last_name = '${last_name}', email_address = '${email_address}', birthday = '${birthday}', account_status = '${account_status}' WHERE customer_id = ${customer_id}`;
        console.log(sql);
        dbWrite(sql, callback);
    }

    // READ
    async listCustomers(callback) {
        var sql = `SELECT customer_id, email_address, first_name, last_name, birthday, account_status FROM ${tableName}`;
        dbRead(sql, callback);
    }

    async checkDuplicateEmail(email_address, callback) {
        var sql = `SELECT email_address FROM ${tableName} WHERE email_address = '${email_address}'`;
        console.log(sql);
        dbRead(sql, callback);
    }

    async checkDuplicateEmailOnUpdate(email_address, customer_id, callback) {
        var sql = `SELECT email_address FROM ${tableName} WHERE email_address = '${email_address}' AND customer_id NOT IN(${customer_id})`;
        console.log(sql);
        dbRead(sql, callback);
    }

    async findCustomerByEmail(email_address, callback) {
        var sql = `SELECT customer_id, email_address, first_name, last_name, birthday, account_status, customer_password FROM ${tableName} WHERE email_address = '${email_address}'`;
        dbRead(sql, callback);
    }

    async findCustomerById(customer_id, callback) {
        var sql = `SELECT customer_id, email_address, first_name, last_name, birthday, account_status, customer_password FROM ${tableName} WHERE customer_id = '${customer_id}'`;
        console.log(sql);
        dbRead(sql, callback);
    }
}