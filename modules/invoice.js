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

        if(start_date || end_date || status || customer_id || engagement_id) {
            sql += ` WHERE`;
        }

        if(start_date) {
            sql += ` due_date >= ${start_date}`;
        }

        if(start_date && end_date) {
            sql += ` AND`;
        }

        if(end_date) {
            sql += ` due_date <= ${end_date}`;
        }

        if(end_date && status) {
            sql += ` AND`;
        }
        
        if(status) {
            sql += ` invoice_status = ${status}`;
        }

        if(status && customer_id) {
            sql += ` AND`;
        }
        
        if(customer_id) {
            sql += ` customer_id = ${customer_id}`;
        }

        if(customer_id && engagement_id) {
            sql += ` AND`;
        }

        if(engagement_id) {
            sql += ` engagement_id = ${engagement_id}`;
        }

        console.log(sql);

        // dbRead(sql, callback);
    }
}