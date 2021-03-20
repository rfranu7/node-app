import { dbConnect } from "./utilities.js";
const tableName = 'payment_plans';

export default class PaymentPlan {

    async enrollCustomer(first_name, last_name, email_address, account_status, callback) {
        var sql = `INSERT INTO ${tableName} (first_name, last_name, email_address, account_status) VALUES (${first_name}, ${last_name}, ${email_address}, ${account_status})`;
        dbConnect(sql, callback);
    }

    async listPlans(callback) {
        var sql = `SELECT * FROM ${tableName}`;
        dbConnect(sql, callback);
    }
}