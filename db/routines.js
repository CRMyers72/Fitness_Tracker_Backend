/* eslint-disable no-useless-catch */
const client = require('./client');
const { attachActivitiesToRoutines } = require('./activities');
const { getUserByUsername } = require('./users')
const util = require('./util')

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
    SELECT routines.*, users.username AS "creatorName"
    FROM routines
    JOIN users ON routines."creatorId" = users.id;
    `);
    const attachedRoutines =  attachActivitiesToRoutines(routines);
    return attachedRoutines
  }catch (error) {
    throw error;
  }
}

async function getAllRoutinesByUser({username}) {
  try{
    const user = await getUserByUsername(username)

    const { rows: routines } = await client.query(`
    SELECT routines.*, users.username AS "creatorName"
    FROM routines
    JOIN users ON routines."creatorId" = users.id
    WHERE "creatorId"=$1;
    `, [user.id])

    
    return attachActivitiesToRoutines(routines);
  } catch (error){
    throw error;
  }
}

async function getPublicRoutinesByUser({username}) {
  try{
    const user = await getUserByUsername(username)

    const { rows: routines } = await client.query(`
    SELECT routines.*, users.username AS "creatorName"
    FROM routines
    JOIN users ON routines."creatorId" = users.id
    WHERE "creatorId"=$1;
    `, [user.id])
    console.log("######", routines)

    return attachActivitiesToRoutines(routines);
  } catch (error) {
    throw error;
  }
}

async function getAllPublicRoutines() {
  try{
    const { rows: routines } = await client.query(`
    SELECT routines.*, users.username AS "creatorName"
    FROM routines
    JOIN users ON routines."creatorId" = users.id
    WHERE "isPublic" = true;
    `)

    return attachActivitiesToRoutines(routines)
  }catch (error){
    throw error
  }
}

async function getPublicRoutinesByActivity({id}) {
  try{
    const { rows: routines } = await client.query(`
      SELECT routines.*, users.username AS "creatorName"
      FROM routines
      JOIN users ON routines."creatorId" = users.id
      JOIN activities_routines ON activities_routines."routineId" = routines.id
      WHERE routines."isPublic" = true
      AND activities_routines."activityId" = $1;
    `, [id]);
    
    return attachActivitiesToRoutines(routines)
  } catch (error) {
    throw error;
  }
}

async function createRoutine({creatorId, isPublic, name, goal}) {

    try {
        const { rows: [routine] } = await client.query(`
        INSERT INTO routines("creatorId", "isPublic", "name", "goal")
        VALUES ($1, $2, $3, $4)
        RETURNING *;
        `, [creatorId, isPublic, name, goal]);
    return routine;
  }catch (error){
    throw error;
  }
}

async function updateRoutine({id, ...fields}) {
  
  try{
    const updatedRoutine = {}
    for(let columns in fields){
      if(fields[columns] !== undefined) updatedRoutine[columns] = fields[columns]
    }

    let routine 
    if(util.dbFields(fields).insert.length > 0){
      const { rows } = await client.query(`
      UPDATE routines
      SET ${util.dbFields(updatedRoutine).insert}
      WHERE id = ${id}
      RETURNING *;
      `, Object.values(updatedRoutine))
      routine = rows[0]
      console.log("Updating works and returns the correct item. The tests are broken", routine)
      return routine
    }
    
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