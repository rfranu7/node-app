import { dbRead, dbWrite } from "./utilities.js";
const tableName = 'customers';

export default class Customer {

    async enrollCustomer(first_name, last_name, email_address, account_status, callback) {
        var sql = `INSERT INTO ${tableName} (first_name, last_name, email_address, account_status) VALUES ('${first_name}', '${last_name}', '${email_address}', '${account_status}')`;
        console.log(sql);
        dbWrite(sql, callback);
    }

    async updateCustomer(customer_id, array, callback) {

        var queryString = '';
        for (let index = 0; index < array.length; index++) {
            const element = array[index];
            if(index == array.length) {
                const key = Object.keys(element);
                queryString += `${key[0]} = ${element[key]}`;
            } else {
                queryString += `${key[0]} = ${element[key]},`;
            }
        }

        var sql = `UPDATE ${tableName} SET ${queryString} WHERE customer_id = ${customer_id}`;
        console.log(sql);
        dbWrite(sql, callback);
    }

    async checkDuplicateEmail(email_address, callback) {
        var sql = `SELECT email_address FROM ${tableName} WHERE email_address = '${email_address}'`;
        console.log(sql);
        dbRead(sql, callback);
    }

    async findCustomerByEmail(email_address, callback) {
        var sql = `SELECT customer_id, email_address, first_name, last_name, birthday, account_status, customer_password FROM ${tableName} WHERE email_address = '${email_address}'`;
        console.log(sql);
        dbRead(sql, callback);
    }
}