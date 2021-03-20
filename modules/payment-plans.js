import { dbRead, dbWrite } from "./utilities.js";
const tableName = 'payment_plans';

export default class PaymentPlan {

    async listPlans(callback) {
        var sql = `SELECT * FROM ${tableName}`;
        dbRead(sql, callback);
    }
}