const express = require('express')
const router = express.Router();

const { 
    createActivity,
    getAllActivities,
    getActivityById,
    getPublicRoutinesByActivity,
    updateActivity
 } = require('../db/index');
const { requireUser, requiredNotSent } = require('./utils');

 router.get('/', async (req, res, next)=>{
    try{
        const activities = await getAllActivities()
        res.send(activities)
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
        const { id } = req.params.activityId
        const fields = req.body
        const updatedActivity = updateActivity({id, fields})
        if(!updateActivity){
            next({
                name: "UpdateActivityError",
                message: "That activity could not be updated"
            })
        }
        res.send(updatedActivity, "Activity was updated")
        
    }catch(error){
        next(error)
    }
 })

 router.get('/:activitiesId/routines', async (req, res, next)=>{
    try{
        const { activityId } = req.params
        const routines = await getPublicRoutinesByActivity({activityId})
        if(!routines){
            next({
                name: "routinesError",
                message: "No routines exist with that activity"
            })
        }
        res.send(routines)
    }catch(error){
        next(error)
    }
 })

 module.exports = router