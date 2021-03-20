import { dbRead, dbWrite } from "./utilities.js";
const tableName = 'invoices';

export default class Invoice {

    // INSERT
    async addInvoice(invoice_number, customer_id, engagement_id, due_date, sub_total, price_adjustments, total_amount, notes, callback) {
        var sql = `INSERT INTO ${tableName} (invoice_number, customer_id, engagement_id, due_date, sub_total, price_adjustments, total_amount, notes) VALUES ('${invoice_number}', '${customer_id}', '${engagement_id}', '${due_date}', '${sub_total}', '${price_adjustments}', '${total_amount}', '${notes}')`;
        console.log(sql);
        dbWrite(sql, callback);
    }

    // UPDATE
    async updateInvoice(invoice_id, invoice_number, customer_id, engagement_id, due_date, sub_total, price_adjustments, total_amount, notes, callback) {
        var sql = `UPDATE ${tableName} SET invoice_number = ${invoice_number}, customer_id = ${customer_id}, engagement_id = ${engagement_id}, due_date = ${due_date}, sub_total = ${sub_total}, price_adjustments = ${price_adjustments}, total_amount = ${total_amount}, notes = ${notes} WHERE invoice_id = ${invoice_id}`;
        console.log(sql);
        dbWrite(sql, callback);
    }

    // GET
    async listInvoices(callback, start_date = null, end_date = null, status = null, customer_id = null, engagement_id = null) {
        var sql = `SELECT * FROM ${tableName}`;
        
        var filteredFields = [];
        
        if(start_date != null) {
            filteredFields.push({"start_date": start_date});
        }
        
        if(end_date != null) {
            filteredFields.push({"end_date": end_date});
        }

        if(status != null) {
            filteredFields.push({"status": status});
        }

        if(customer_id != null) {
            filteredFields.push({"customer_id": customer_id});
        }

        if(engagement_id != null) {
            filteredFields.push({"engagement_id": engagement_id});
        }

        console.log(filteredFields);

        if(filteredFields.length >= 1) {
           sql += ` WHERE`;
           
           for (let index = 0; index < filteredFields.length; index++) {
               const element = filteredFields[index];
               const key = Object.keys(element);
               const value = filteredFields[index][key[0]];
               const value2 = filteredFields[index].key[0];

               console.log(element);
               console.log(key);
               console.log(value);
               console.log(value2);

                if(index != filteredFields.length) {
                    if(key[0] == "start_date") {
                        sql += ` due_date >= '${element.key[0]}'`;
                    } else if(key[0] == "end_date") {
                        sql += ` due_date <= '${element.key[0]}'`;
                    } else if(key[0] == "status") {
                        sql += ` invoice_status = '${element.key[0]}'`;
                    } else if(key[0] == "end_date") {
                        sql += ` customer_id = ${element.key[0]}`;
                    } else if(key[0] == "end_date") {
                        sql += ` engagement_id = ${element.key[0]}`;
                    }
                    sql +=` AND`
                } else {
                    if(key[0] == "start_date") {
                        sql += ` due_date >= '${element.key[0]}'`;
                    } else if(key[0] == "end_date") {
                        sql += ` due_date <= '${element.key[0]}'`;
                    } else if(key[0] == "status") {
                        sql += ` invoice_status = '${element.key[0]}'`;
                    } else if(key[0] == "end_date") {
                        sql += ` customer_id = ${element.key[0]}`;
                    } else if(key[0] == "end_date") {
                        sql += ` engagement_id = ${element.key[0]}`;
                    }
                }
           }
        }

        console.log(sql);

        // dbRead(sql, callback);
    }
}