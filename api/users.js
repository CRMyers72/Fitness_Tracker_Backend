const express = require('express')
const router = express.Router();
const jwt = require('jsonwebtoken')
const { JWT_SECRET = 'neverTell'} = process.env;
const { 
    createUser,
    getUserByUsername,
    getPublicRoutinesByUser,
    getAllRoutinesByUser,
    getUser
} = require('../db/index')

router.post('/login', async (req, res, next)=>{
    const { username, password }= req.body
    if(!username || !password){
        next({
            name: "MissingCredentialsError",
            message: "Please supply both a username and password"
        });
    }
    try{
        const user = await getUser({username, password})
        if(!user){
            next({
                name: "IncorrectCredentialError",
                message: "Username or password are incorrect"
            })
        }else {
            const token = jwt.sign({id: user.id, username: user.username}, JWT_SECRET, {expiresIn:"1w"})
            res.send({
                user, message: "You're Logged In!", token
            })
        }
        
    }catch(error){
        next(error)
    }
})





module.exports = router