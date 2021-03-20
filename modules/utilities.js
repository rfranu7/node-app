import pkg from 'pg';
const { Pool } = pkg;

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({
  connectionString: connectionString,
  ssl: { rejectUnauthorized: false }
});

export async function dbRead(sql, callback) {
    pool.connect((err, client, done) => {
        if (err) throw err
        client.query(sql, (err, response) => {
            done()
            if (err) {
                console.log(err.stack)
            } else {
                callback(response.rows);
            }
        })
    })
}

export async function dbWrite(sql, callback) {
    pool.connect((err, client, done) => {
        if (err) throw err
        client.query(sql, (err, response) => {
            done()
            if (err) {
                console.log(err.stack)
            } else {
                callback(response);
            }
        })
    })
}