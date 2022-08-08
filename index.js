// create the express server here
require('dotenv').config()
const { PORT = 3000 } = process.env
const express = require('express')
const app = express();

const bodyParser = require('body-parser')
app.use(bodyParser.json)

const morgan = require('morgan')
app.use(morgan('dev'))