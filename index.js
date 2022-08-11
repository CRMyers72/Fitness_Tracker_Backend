// create the express server here
require('dotenv').config()
const { PORT = 3000 } = process.env
const express = require('express')
const app = express();

const bodyParser = require('body-parser')
app.use(bodyParser.json)

const morgan = require('morgan')
app.use(morgan('dev'))

const cors = require('cors')
app.use(cors)

app.use((req, res, next) =>{
    console.log(req.body)
    next()
})
  
const apiRouter = require('./api');
app.use('/api', apiRouter);
  
const { client } = require('./db/client')
console.log(client)
client.connect()

app.get('/', function (req, res) {
    res.send('Hello World!'); // This will serve your request to '/'.
});

app.listen(PORT, () => {
  console.log("The server is up on port", PORT);
});
