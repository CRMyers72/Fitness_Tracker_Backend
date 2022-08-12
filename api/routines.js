const express = require('express')
const router = express.Router();

const {
    createRoutine,
    getAllPublicRoutines,
    updateRoutine,
    destroyRoutine,
    addActivityToRoutine,
    destroyRoutineActivity,
    getRoutineById,
    getRoutineActivitiesByRoutine,
    getActivityByName,
    attachActivitiesToRoutines

}= require('../db/index');
const { requireUser, requiredNotSent } = require('./utils');

router.get('/', requireUser, async (req, res, next)=>{
    try{
        routines = await getAllPublicRoutines();
        res.send(routines)
    }catch(error){
        next(error)
    }
})

router.post('/',requireUser, async (req, res, next)=>{
    const {creatorId} = req.user.id
    const { isPublic, name, goal } = req.body
    try{
        const newRoutine = await createRoutine({ creatorId, isPublic, name, goal })
        res.send(newRoutine, "Routine Created")
    }catch(error){
        next(error)
    }
})

router.patch('/:routineId', requireUser, requiredNotSent({requiredParams:["isPublic", "name", "goal"], atLeastOne: true}), async(req, res, next)=>{
    try{
        const { id } = req.params.routineId
        const fields = req.body
        const updatedRoutine = updateRoutine({id, fields})
        res.send(updatedRoutine)
    }catch(error){
        next(error)
    }
})

router.delete('/:routineId', requireUser, async (req, res, next)=>{
    try{
        const { id } = req.params.routineId
        const _routine = getRoutineById(id)
        if(!_routine){
            next({
                name: "DestroyRoutineError",
                message: "That Routine does not exist"
            })
        }
        const routineActivityId = await getRoutineActivitiesByRoutine(id)
        await destroyRoutineActivity(routineActivityId.id)
        await destroyRoutine(id)
         
         res.send("Routine Destroyed")
    }catch(error){
        next(error)
    }
})

router.post('/:routineId/activities', requireUser, async (req, res, next)=>{
    try{
        const { routineId } = req.params.routineId
        const { activityName, count, duration } = req.body
        const routine = getRoutineById({routineId})
        const activity = getActivityByName(activityName)
        const activityId = activity.id
        const routineActivity = { routineId, activityId, count, duration }
        if(!activityName || !count || !duration){
            next({
                name: "RequirementsError",
                message: "Please provide the activity name, count and duration"
            })
        } else if(!routine){
            next({
                name: "RoutineError",
                message: "That routine does not exist"
            })
        } else if(!activity){
            next({
                name: "ActivityError",
                message: "That activity does not exist"
            })
        }else{

            await addActivityToRoutine(routineActivity)
            const routineWithActivity = await attachActivitiesToRoutines(routine)
            res.send(routineWithActivity)
        }
    }catch(error){
        next(error)
    }
})



module.exports = router