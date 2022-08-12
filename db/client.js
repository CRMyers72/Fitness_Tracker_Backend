// build and export your unconnected client here
const { Client } = require('pg')
const connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/fitness_dev'
const client = new Client({
  connectionString: connectionString,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
})
module.exports = client
// exports.client = client