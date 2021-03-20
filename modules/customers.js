import { dbRead, dbWrite } from "./utilities.js";
const tableName = 'customers';

export default class Customer {

    async enrollCustomer(first_name, last_name, email_address, account_status, callback) {
        var sql = `INSERT INTO ${tableName} (first_name, last_name, email_address, account_status) VALUES ('${first_name}', '${last_name}', '${email_address}', '${account_status}')`;
        console.log(sql);
        dbWrite(sql, callback);
    }

    async findCustomerByEmail(email_address) {
        var sql = `SELECT email_address FROM ${tableName} WHERE email_address = '${email_address}'`;
        console.log(sql);
        dbRead(sql, (response) => {
            return response;
        });
    }
}