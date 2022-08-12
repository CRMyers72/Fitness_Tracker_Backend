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

const activityRouter = require('./activities') 
router.use('/activities', activityRouter)

const routineRouter = require('./routines')
router.use('/routines', routineRouter)

const routineActivityRouter = require('./routine_activities')
router.use('/routine_activities', routineActivityRouter)

module.exports = router