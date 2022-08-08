/* eslint-disable no-useless-catch */
const client = require("./client");
const { createRoutine } = require("./routines");
const { addActivityToRoutine } = require("./routine_activities")

// database functions
async function getAllActivities() {
  try{
    // const { rows: id } = await client.query(`
    // SELECT id
    // FROM activities;
    // `);

    // const activities = await Promise.all(id.map(
    //   activity => getActivityById( activity.id )
    // ));

    const { rows: activities } = await client.query(`
    SELECT *
    FROM activities;
    `)
    console.log(activities)
    return activities;
  } catch (error){
    throw error;
  }
}

async function getActivityById(id) {
  try{
    const {rows: [ activity ] } = await client.query(`
    SELECT *
    FROM activities
    WHERE id=$1;
    `, [id]);
   
    if (!activity) {
      throw {
        name: "ActivityNotFoundError",
        message: "No post with that Id found"
      }
    }

    return activity
  } catch (error){
    throw error
  }
}

async function getActivityByName(name) {
  try{
    const { rows: [ activity ] } = await client.query(`
    SELECT *
    FROM actvities
    WHERE name=$1;
    `, [ name ])

    if(!activity) {
      throw{
        name: "NameNotFoundError",
        message: "An activity with that name does not exist"
      }
    }
  
    return activity;
  }catch (error) {
    throw error
  }
}


async function attachActivitiesToRoutines(routines, routineId) {
  try{
    const activityRoutinePromise = routines.map(
      routine => addActivityToRoutine(routine.id)
    )

    await Promise.all(activityRoutinePromise)

    return await getActivityById(routineId)
  } catch (error){
    throw error;
  }
}

// select and return an array of all activities
async function createActivity({ name, description }) {
  const newName = name.toLowerCase();
  try{
    const { rows: [ activity ] } = await client.query(`
    INSERT INTO activities (name, description)
    VALUES($1, $2)
    ON CONFLICT (name) DO NOTHING
    RETURNING *;
    `, [newName, description]);
    return activity
  }catch (error){
    throw error;
  }
}

// return the new activity
async function updateActivity({ id, ...fields }) {
  const { routines } = fields;
  delete fields.routines

  const setString = Object.keys(fields).map(
    (key, index) => `"${ key }" =$${ index + 1}`
  ).join(', ')

  try{
    if (setString.length>0){
      await client.query(`
      UPDATE activities
      SET  ${ setString }
      WHERE id=${ id }
      RETURNING *;
      `, Object.values(fields))
    }

    if (routines === undefined){
      return await getActivityById(id)
    }

    const routineList = await createRoutine(routines)
    const routineListIdString = routineList.map(
      routine => `${routine.id}`
    ).join(', ')

    await client.query(`
      DELETE FROM activities_routines
      WHERE "routineId"
      NOT IN (${ routineListIdString })
      AND "activityId"=$1;
    `, [id])
    
    await attachActivitiesToRoutines(id, routineList)

    return await getActivityById(id)
  } catch (error) {
    throw error
  }
}

// don't try to update the id
// do update the name and description
// return the updated activity
module.exports = {
  getAllActivities,
  getActivityById,
  getActivityByName,
  attachActivitiesToRoutines,
  createActivity,
  updateActivity,
}
