// create an api router
// attach other routers from files in this api directory (users, activities...)
// export the api router
const express = require('express')
const router = express.Router();
const jwt = require('jsonwebtoken')
const client = require('../db/client')

const { JWT_SECRET = 'neverTell'} = process.env;





const userRouter = require('./users')
router.use('/users', userRouter)

module.exports = router