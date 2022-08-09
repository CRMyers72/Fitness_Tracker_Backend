/* eslint-disable no-useless-catch */
const client = require('./client');
const { 
  // createActivity, 
  attachActivitiesToRoutines
 } = require('./activities');
const { addActivityToRoutine } = require('./routine_activities');

async function getRoutineById(id){
  try{
    const { rows: [ routine ] } = await client.query(`
    SELECT *
    FROM routines
    WHERE id=$1;
    `, [id]);

    if(!routine) {
      throw {
        name: "RoutineNotFoundError",
        message: "Could not find that routine"
      }
    }

    const { rows: activities } = await client.query(`
      SELECT activities.*
      FROM activities
      JOIN activities_routines ON activities.id=activities_routines."activityId"
      WHERE activities_routines."routineId"=$1;
    `, [id])

    const { rows: [ user ] } = await client.query(`
      SELECT id, username, name, location
      FROM users
      WHERE id=$1;
    `, [routine.userId])

    // routine.activities = activities;
    // routine.user = user;

    delete routine.userId;

    return routine;
  } catch (error){
    throw error;
  }
}

async function getRoutinesWithoutActivities(){
  try{
    const { rows } = await client.query(`
    SELECT *
    FROM routines;
    `)

    return rows;
  } catch(error){
    throw error;
  }
}


async function getAllRoutines() {
  try{
    const { rows: routines } = await client.query(`
    SELECT *
    FROM routines
    JOIN users ON routines."creatorId" = users.id;
    `);
    console.log(routines, "these are the rows=(")
    const attachedRoutines =  attachActivitiesToRoutines(routines);
    console.log('########')
    console.log(attachedRoutines, "###########")
    return attachedRoutines
  }catch (error) {
    throw error;
  }
}

async function getAllRoutinesByUser({username}) {
  try{
    const { rows: routineIds } = await client.query(`
    SELECT id
    FROM routines
    WHERE username=$1;
    `, [username])

    const routines = await Promise.all(routineIds.map(
      routine => getRoutineById ( routine.id )
    ))
    
    return routines;
  } catch (error){
    throw error;
  }
}

async function getPublicRoutinesByUser({username}) {
  try{
    const { rows: routineId } = await client.query(`
    SELECT id
    FROM routines
    WHERE "creatorId"=$1;
    `, [username])

    const routines = await Promise.all(routineId.map(
      routine => getRoutineById( routine.id )
    ))

    return routines;
  } catch (error) {
    throw error;
  }
}

async function getAllPublicRoutines() {
  try{
    const { rows } = await client.query(`
    SELECT *
    FROM routines
    WHERE "isPublic" = true;
    `)
    return rows
  }catch (error){
    throw error
  }
}

async function getPublicRoutinesByActivity({id}) {
  try{
    const { rows: routineIds } = await client.query(`
      SELECT routine.id
      FROM routines
      JOIN activities_routines ON routines.id=activities_routines."routineId"
      JOIN activities ON activities.id=activities_routines."activityId"
      WHERE activities.id=$1
    `, [id]);

    return await Promise.all(routineIds.map(
      routine => getRoutineById(routine.id)
    ))
  } catch (error) {
    throw error;
  }
}

async function createRoutine({creatorId, isPublic, name, goal}) {

    try {
        const { rows: [routine] } = await client.query(`
        INSERT INTO routines("creatorId", "isPublic", name, goal)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (name) DO NOTHING
        RETURNING *;
        `, [creatorId, isPublic, name, goal]);
        
    return routine;
  }catch (error){
    throw error;
  }
}

async function updateRoutine({id, ...fields}) {

  const { activities } = fields;
  delete fields.activities

  const setString = Object.keys(fields).map(
    (key, index) => `"${ key }"=$${ index + 1 }`
  ).join(', ')

  try{
    if (setString.length>0) {
      await client.query(`
      UPDATE routines
      SET ${ setString }
      WHERE id=${ id }
      RETURNING *;
      `, Object.values(fields))
    }

    if (activities === undefined) {
      return await getRoutineById(id)
    }

    // const activityList = await createActivity(activities)
    const activityListIdString = activityList.map(
      activity => `${ activity.id }`
    ).join(', ');

    await client.query(`
    DELETE FROM activities_routines
    WHERE "activityId"
    NOT IN (${ activityListIdString })
    AND "routineId"=$1;
    `, [id])

    await addActivityToRoutine(id, activityList)

    return await getRoutineById(id)
  } catch (error){
    throw error;
  }
}

async function destroyRoutine(id) {
  try{
    await client.query(`
    DELETE FROM routines
    WHERE id=$1
    `, [id])
  }catch(error){
    throw error;
  }
}

module.exports = {
  getRoutineById,
  getRoutinesWithoutActivities,
  getAllRoutines,
  getAllPublicRoutines,
  getAllRoutinesByUser,
  getPublicRoutinesByUser,
  getPublicRoutinesByActivity,
  createRoutine,
  updateRoutine,
  destroyRoutine,
}