const express = require('express');
const app = express();
const cors = require('cors')
const dotenv = require('dotenv')
const path = require('path');

dotenv.config();

const dbService = require('./dbservice')

app.use(cors())
app.use(express.json());
app.use(express.urlencoded({extended: false}))

//serve client files from node
app.use(express.static(path.join(__dirname, 'client')))

// read
app.get('/getAll', (request, response) => {
    // check for db instance
    const db = dbService.getDbServiceInstance();
    const result = db.getAllData();
    console.log(result)
    result.then(data => response.json({data : data}))
        .catch(err => console.log(err));

})

// The "catchall" handler: for any request that doesn't
// match one above, send back clinetsindex.html file.
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname+'/client/index.html'));
  });

app.listen(process.env.PORT, () => console.log('app is running'));

