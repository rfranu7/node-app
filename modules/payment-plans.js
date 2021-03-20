import { dbRead, dbWrite } from "./utilities.js";
const tableName = 'payment_plans';

export default class PaymentPlan {

    // INSERT
    async addPlan(plan_id, plan_name, plan_terms, callback) {
        var sql = `INSERT INTO ${tableName} (plan_id, plan_name, plan_terms) VALUES ('${plan_id}', '${plan_name}', '${plan_terms}')`;
        console.log(sql);
        dbWrite(sql, callback);
    }

    // UPDATE
    async updatePlan(plan_id, plan_name, plan_terms, callback) {
        var sql = `UPDATE ${tableName} SET plan_name = '${plan_name}', plan_terms = '${plan_terms}') WHERE plan_id = ${plan_id}`;
        console.log(sql);
        dbWrite(sql, callback);
    }

    // GET
    async listPlans(callback) {
        var sql = `SELECT * FROM ${tableName}`;
        dbRead(sql, callback);
    }
}