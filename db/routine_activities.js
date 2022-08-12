/* eslint-disable no-useless-catch */
// const { attachActivitiesToRoutines } = require('./activities');
const client = require('./client')
const util = require('./util')

async function getRoutineActivityById(id){
  try{
    const { rows: [ routineActivity ] } = await client.query(`
      SELECT id, "routineId", "activityId", count, duration
      FROM activities_routines
      WHERE id=${id}
    `)

    if(!routineActivity) {
      throw{
        name: "RoutineActivityNotFoundError",
        message: "A routine activity combination with that id does not exist"
      }
    }
    
    return routineActivity
  }catch (error) {
    throw error;
  }
}
async function creatRoutineActivities(routineId, activityId, count, duration){
    try{
        const { rows: routineActivity } = await client.query(`
            INSERT INTO activities_routines("routineId", "activityId", count, duration)
            VALUES ($1, $2, $3, $4)
            RETURNING *;
        `, [routineId, activityId, count, duration])
        return routineActivity
      } catch(error){
        throw error
      }
    }
    
    async function addActivityToRoutine(routineActivity) {
      const { routineId, activityId, count, duration } = routineActivity
      try{
        const createroutineActivitiesPromise = await creatRoutineActivities(routineId, activityId, count, duration) 
        return createroutineActivitiesPromise
    }catch (error){
      throw error;
    }
}

async function getRoutineActivitiesByRoutine({id}) {
  try{
    const { rows: routineActivityIds } = await client.query(`
      SELECT id
      FROM activities_routines
      WHERE "routineId"=$1
    `,[id])

    return await Promise.all(routineActivityIds.map(
      roAcId => getRoutineActivityById(roAcId.id)
    ))
  }catch(error){
    throw error;
  }
}

async function updateRoutineActivity ({id, ...fields}) {

  try{
    const updatedRoutineActivity = {}
    for(let columns in fields){
      if(fields[columns] !== undefined) updatedRoutineActivity[columns] = fields[columns]
    }

    let routineActivity
    if(util.dbFields(fields).insert.length > 0){
      const { rows } = await client.query(`
      UPDATE activities_routines
      SET ${util.dbFields(updatedRoutineActivity).insert}
      WHERE id = ${id}
      RETURNING *;
      `, Object.values(updateRoutineActivity))
      routineActivity = rows[0]
      console.log("routineActiviteUpdates", routineActivity)
      return routineActivity
    }
  } catch (error) {
    throw error;
  }
}

async function destroyRoutineActivity(id) {
  try{
    const {rows: [routineActivity] } = await client.query(`
    DELETE FROM activities_routines
    WHERE id=$1
    RETURNING *;
    `, [id])

    return routineActivity
  }catch (error) {
    throw error;
  }
}

async function canEditRoutineActivity(routineActivityId, userId) {
  try{
    const { routineId } = await client.query(`
      SELECT routineId
      FROM activites_routines
      WHERE id=$1;
    `, [routineActivityId])

    if(!routineId){
      throw{
        name: "activityIdError",
        message: "there is no routine with that routineActivityId"
      }
    }

    const { userIdCheck } = await client.query(`
      SELECT userId
      FROM routines
      WHERE id=$1;
    `, [routineId])

    if(userIdCheck !== userId) {
      throw{
        name: "userError",
        messgae: "You do not have access to edit this routineActivity"
      }
    }else{
      throw{
        name: "success",
        message: true
      }
    }

  }catch (error) {
    throw error;
  }
}

module.exports = {
  getRoutineActivityById,
  addActivityToRoutine,
  getRoutineActivitiesByRoutine,
  updateRoutineActivity,
  destroyRoutineActivity,
  canEditRoutineActivity,
};
