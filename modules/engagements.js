import { dbRead, dbWrite } from "./utilities.js";
const tableName = 'engagements';

export default class Engagement {

    // INSERT
    async addEngagement(engagement_name, duration, total_fee, callback) {
        var sql = `INSERT INTO ${tableName} (engagement_name, duration, total_fee) VALUES ('${engagement_name}', '${duration}', '${total_fee}')`;
        console.log(sql);
        dbWrite(sql, callback);
    }

    async addPaymentTerms(engagement_id, plan_id, callback) {
        var sql = `INSERT INTO engagement_terms (engagement_id, plan_id) VALUES ('${engagement_id}', '${plan_id}')`;
        console.log(sql);
        dbWrite(sql, callback);
    }

    // UPDATE
    async updateEngagement(engagement_id, engagement_name, duration, total_fee, callback) {
        var sql = `UPDATE ${tableName} SET engagement_name = '${engagement_name}', duration = '${duration}', total_fee = '${total_fee}' WHERE engagement_id = ${engagement_id}`;
        console.log(sql);
        dbWrite(sql, callback);
    }

    // READ
    async listEngagements(callback) {
        var sql = `SELECT * FROM ${tableName}`;
        dbRead(sql, callback);
    }

    async getEngagement(engagement_id, callback) {
        var sql = `SELECT * FROM ${tableName} WHERE engagement_id = ${engagement_id}`;
        dbRead(sql, callback);
    }

    async getEnrolledStudents(engagement_id, callback) {
        var sql = `SELECT ce.customer_id, ce.engagement_id, first_name, last_name, birthday, account_status, engagement_name FROM customer_engagement ce JOIN customers c ON c.customer_id = ce.customer_id JOIN engagements e ON e.engagement_id = ce.engagement_id WHERE ce.engagement_id = ${engagement_id}`;
        dbRead(sql, callback)
    }
}