// require and re-export all files in this db directory (users, activities...)
const { createUser, getUser, getUserById, getUserByUsername } = require('./users')
const { getAllActivities, createActivity, updateActivity, getActivityById } = require('./activities')
const { getAllRoutines, getAllPublicRoutines, getAllRoutinesByUser, getRoutineById, getPublicRoutinesByUser, getPublicRoutinesByActivity, createRoutine, updateRoutine, destroyRoutine } = require('./routines')
const { updateRoutineActivity, getRoutineActivitiesByRoutine, addActivityToRoutine, destroyRoutineActivity } = require('./routine_activities')

module.exports ={
    createUser,
    getUser,
    getUserById,
    getUserByUsername,
    getAllActivities,
    createActivity,
    updateActivity,
    getActivityById,
    getAllPublicRoutines,
    getAllRoutines,
    getAllRoutinesByUser,
    getRoutineById,
    getPublicRoutinesByUser,
    getPublicRoutinesByActivity,
    createRoutine,
    updateRoutine,
    destroyRoutine,
    updateRoutineActivity,
    getRoutineActivitiesByRoutine,
    addActivityToRoutine,
    destroyRoutineActivity
}