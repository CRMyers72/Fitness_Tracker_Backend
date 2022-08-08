/* eslint-disable no-useless-catch */
const client = require("./client");

// database functions

// user functions
async function createUser({ username, password }) {
  // eslint-disable-next-line no-useless-catch
  try {
    const { rows: [ user ] } = await client.query(`
    INSERT INTO users(username, password)
    VALUES($1, $2)
    ON CONFLICT (username) DO NOTHING
    RETURNING *;
    `, [username, password]);
    delete user.password

    return user;
  } catch (error){
    throw error;
  }
}

async function getUser({ username, password }) {
  try{
    const { rows: [ user ] } = await client.query(`
    SELECT *
    FROM users
    WHERE username=$1;
    `, [ username ])
    if(user.password !== password){
      throw{
        name: "IncorrectPassword",
        message: "Password and Username do not match"
      }
    }
    delete user.password
    
    return user
  }catch(error){
    throw error;
  }
}

async function getUserById(userId) {
  try{
    const { rows: [ user ] } = await client.query(`
    SELECT *
    FROM users
    WHERE id=$1;
    `, [userId]);

    if(!user) {
      throw {
        name: "UserNotFoundError",
        message: "That user does not exist"
      }
    }
    delete user.password

    return user;
  } catch (error) {
    throw error;
  }
}

async function getUserByUsername(userName) {
  try{
    const { rows: [ user ] } = await client.query(`
    SELECT *
    FROM users
    WHERE username=$1;
    `, [ userName ]);
    if(!user) {
      throw{
        name: "UserNotFoundError",
        message: "That username does not exist"
      }
    }
    delete user.password

    return user;
  } catch (error){
    throw error;
  }
}

module.exports = {
  createUser,
  getUser,
  getUserById,
  getUserByUsername,
}
