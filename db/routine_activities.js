/* eslint-disable no-useless-catch */
// const { attachActivitiesToRoutines } = require('./activities');
const client = require('./client')

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
        console.log(routineActivity)
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

  const { routineId, activityId } = fields
  delete fields.routineId
  delete fields.activityId

  const setString = Object.keys(fields).map(
    (key, index) => `"${ key }"=$${ index + 1 }`
  ).join(', ')

  try{
    if (setString.length > 0) {
      await client.query(`
        UPDATE activities_routines
        SET ${ setString }
        WHERE id=${ id }
        RETURNING *;
      `, Object.values(fields))
    }

    if (routineId === undefined && activityId === undefined) {
      return await getRoutineActivityById(id)
    }

    return await getRoutineActivityById(id)
  } catch (error) {
    throw error;
  }
}

async function destroyRoutineActivity(id) {
  try{
    await client.query(`
    DELETE * FROM activites_routines
    WHERE id=${id}
    `)
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
