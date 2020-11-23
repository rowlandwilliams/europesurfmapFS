const mysql = require('mysql')
const dotenv = require('dotenv')
dotenv.config()
let instance = null;
console.log(process.env.HOST)

const connection = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    port: process.env.DB_PORT
})

connection.connect((error) => { // establish db connection
    if (error) {
        console.log(error.message)
    }
    console.log('db ' + connection.state);
})

class DbService {
    static getDbServiceInstance() {
        return instance ? instance : new DbService();
    }

    async getAllData() {
        try {
            const response = await new Promise((resolve, reject) =>
            {
                const query = "SELECT * FROM mswMap.spotdata;"; //grab all data
                
                connection.query(query, (err, results) => {
                    if (err) reject(new Error(err.message));
                    resolve(results);
                })
            })

            return response;
        }
        catch (error) {
            console.log(error);
        }
    }
}

module.exports = DbService;