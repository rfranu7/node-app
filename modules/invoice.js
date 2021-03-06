import { dbRead, dbWrite } from "./utilities.js";
const tableName = 'invoices';

export default class Invoice {

    // INSERT
    async addInvoice(invoice_number, customer_id, engagement_id, due_date, notes, callback) {
        var sql = `INSERT INTO ${tableName} (invoice_number, customer_id, engagement_id, due_date, notes) VALUES ('${invoice_number}', '${customer_id}', '${engagement_id}', '${due_date}', '${notes}') RETURNING invoice_id`;
        console.log(sql);
        dbWrite(sql, callback);
    }

    async addInvoiceItems(invoice_id, item_description, item_amount, callback) {
        var sql = `INSERT INTO invoice_items (invoice_id, item_description, item_amount) VALUES ('${invoice_id}', '${item_description}', '${item_amount}')`;
        console.log(sql);
        dbWrite(sql, callback);
    }

    // UPDATE
    async updateInvoice(invoice_id, customer_id, engagement_id, due_date, price_adjustments, notes, callback) {
        var sql = `UPDATE ${tableName} SET customer_id = ${customer_id}, engagement_id = ${engagement_id}, due_date = '${due_date}', price_adjustments = ${price_adjustments}, total_amount = total_amount - ${price_adjustments}, notes = '${notes}' WHERE invoice_id = ${invoice_id}`;
        console.log(sql);
        dbWrite(sql, callback);
    }

    async updateInvoiceAmount(invoice_id, item_amount, callback) {
        var sql = `UPDATE ${tableName} SET sub_total = ${item_amount} + sub_total, total_amount = ${item_amount} + sub_total - price_adjustments WHERE invoice_id = ${invoice_id}`;
        console.log(sql);
        dbWrite(sql, callback);
    }

    async updateInvoiceStatus(invoice_id, invoice_status, callback) {
        var sql = `UPDATE ${tableName} SET invoice_status = '${invoice_status}' WHERE invoice_id = ${invoice_id}`;
        console.log(sql);
        dbRead(sql, callback);
    }

    // GET
    async listInvoices(callback, start_date = null, end_date = null, status = null, customer_id = null, engagement_id = null) {
        var sql = `SELECT * FROM ${tableName} i JOIN customers c ON c.customer_id = i.customer_id JOIN engagements e ON e.engagement_id = i.engagement_id`;
        
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

               console.log(element);
               console.log(key);
               console.log(value);

                if(index == (filteredFields.length-1)) {
                    if(key[0] == "start_date") {
                        sql += ` due_date >= '${value}'`;
                    } else if(key[0] == "end_date") {
                        sql += ` due_date <= '${value}'`;
                    } else if(key[0] == "status") {
                        sql += ` invoice_status = '${value}'`;
                    } else if(key[0] == "customer_id") {
                        sql += ` i.customer_id = ${value}`;
                    } else if(key[0] == "engagement_id") {
                        sql += ` i.engagement_id = ${value}`;
                    }
                } else {
                    if(key[0] == "start_date") {
                        sql += ` due_date >= '${value}'`;
                    } else if(key[0] == "end_date") {
                        sql += ` due_date <= '${value}'`;
                    } else if(key[0] == "status") {
                        sql += ` invoice_status = '${value}'`;
                    } else if(key[0] == "customer_id") {
                        sql += ` i.customer_id = ${value}`;
                    } else if(key[0] == "engagement_id") {
                        sql += ` i.engagement_id = ${value}`;
                    }
                    sql +=` AND`
                }
           }
        }

        console.log(sql);

        dbRead(sql, callback);
    }

    async getInvoice(invoice_id, callback) {
        var sql = `SELECT * FROM ${tableName} i JOIN customers c ON c.customer_id = i.customer_id JOIN engagements e ON e.engagement_id = i.engagement_id WHERE i.invoice_id = ${invoice_id}`;
        console.log(sql);
        dbRead(sql, callback);
    }

    async getInvoiceItems(invoice_id, invoice, callback) {
        var sql = `SELECT * FROM invoice_items WHERE invoice_id = ${invoice_id}`;
        console.log(sql);
        dbRead(sql, callback);
    }
}