const express = require('express');
const { updateRoutineActivity, destroyRoutineActivity } = require('../db');
const { requireUser, requiredNotSent } = require('./utils');
const router = express.Router();

router.patch('/:routineActivityId', requireUser, requiredNotSent({requiredParams: ["count", "duration"], atLeastOne: true}), async (req, res, next)=>{
    try{
        const { id } = req.params.id
        const fields = req.body

        const updatedRoutineActivity = await updateRoutineActivity({id, fields})
        res.send(updatedRoutineActivity)
    }catch(error){
        next(error)
    }
})

router.delete('/:routineActivityId', requireUser, async(req, res, next)=>{
    try{
        const { id } = req.params.routineActivityId
        destroyRoutineActivity(id)
        res.send("routineActivity Vaporized")
    }catch(error){
        next(error)
    }
})


module.exports = router;