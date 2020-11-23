const express = require('express');
const app = express();
const cors = require('cors')
const dotenv = require('dotenv')

dotenv.config();

const dbService = require('./dbservice')

app.use(cors())
app.use(express.json());
app.use(express.urlencoded({extended: false}))


// read
app.get('/getAll', (request, response) => {
    // check for db instance
    const db = dbService.getDbServiceInstance();
    const result = db.getAllData();
    console.log(result)
    result.then(data => response.json({data : data}))
        .catch(err => console.log(err));

})

// update

// delete

app.listen(process.env.PORT, () => console.log('app is running'));

