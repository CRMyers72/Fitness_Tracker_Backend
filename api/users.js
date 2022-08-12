const express = require('express')
const router = express.Router();
const jwt = require('jsonwebtoken')
const { JWT_SECRET = 'neverTell'} = process.env;
const { 
    createUser,
    getUserByUsername,
    getPublicRoutinesByUser,
    getAllRoutinesByUser,
    getUser,
    getUserById
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
router.post('/register', async (req, res, next)=>{
    const { username, password } = req.body
    if( !username || !password){
        next({
            name: "MissingCredentialError",
            message: "Please supply both a username and password"
        })
    }
    if(password.length < 9){
        next({
            name: "InvalidCredentialErrror",
            message: "Password must be 9 digits or longer"
        })
    }
    try{
        const _user = await getUserByUsername({username})
        if(_user){
            next({
                name: "UsernameError",
                message: "That username is taken"
            })
        }

        const newUser = await createUser({username, password})

        const token = jwt.sign({
            id: newUser.id,
            username
        }, process.env.JWT_SECRET, {
            expiresIn: '1w'
        })

        res.send({
            newUser, message: "registration successful", token
        })
    }catch(error){
        next(error)
    }
})

router.get('/me', async (req, res, next)=>{
    const prefix = 'Bearer';
    const auth = req.header('Authorization');
    if(!auth){
        next();
    }else if(auth.startsWith(prefix)){
        const token = auth.slice(prefix.length);
    }

    try{
        const { id } = jwt.verify(token, JWT_SECRET);

        if(!id){
            next({
                name: 'AuthorizationError',
                message: 'Authorization Token malformed'
            })
            
        }else{
            const user = await getUserById(id);
            const userRoutines = await getAllRoutinesByUser(user.username)
            res.send(user, userRoutines)
        }
        
    }catch(error){
        next(error)
    }
})

router.get('/:userId/routines', async (req, res, next)=>{

    const { username } = req.body
    try{
        routines = await getPublicRoutinesByUser(username)
        if(!routines){
            next({
                name: "RoutinesDataError",
                message: "That user does not have any public routines"
            })
        }
        console.log(routines)
        res.send(routines)
    }catch(error){
        next(error)
    }
})


module.exports = router