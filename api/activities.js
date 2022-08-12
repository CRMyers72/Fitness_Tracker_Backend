const express = require('express')
const router = express.Router();

const { 
    createActivity,
    getAllActivities,
    getActivityById,
    updateActivity,
    getPublicRoutinesByActivity
 } = require('../db/index');
const { requireUser, requiredNotSent } = require('./utils');

 router.get('/', async (req, res, next)=>{
    try{
        const routines = await getAllActivities()
        res.send(routines)
    }catch(error){
        next(error)
    }
 })

 router.post('/', async (req, res, next)=>{
    const { name, description } = req.body;
    if(!name || !description) {
        next({
            name: "MissingActivityInformation",
            message: "Please provide a name and description for the activity"
        })
    }
    try{
        const newActivity = await createActivity({name, description})
        if(!newActivity){
            next({
                name: "ActivityCreationError",
                message: "There has been an error, apologies for the inconvenience"
            })
        }
        res.send(newActivity, "Activity has been created. GET SWOLE!")
    }catch(error){
        next(error)
    }
 })

 router.patch('/:activityId', requireUser, requiredNotSent({requiredParams: ["name", "description"], atLeastOne: true}), async (req, res, next)=>{
    try{
        console.log(req)
        // const updatedActivity
    }catch(error){
        next(error)
    }
 })

 module.exports = router