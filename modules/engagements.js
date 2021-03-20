import { dbRead, dbWrite } from "./utilities.js";
const tableName = 'engagements';

export default class Engagement {

    async listEngagements(callback) {
        var sql = `SELECT * FROM ${tableName}`;
        dbRead(sql, callback);
    }
}