require('dotenv').config()
const { Pool } = require('pg')
console.log("Loaded DATABASE_URL:", process.env.DATABASE_URL);

const pool = new Pool({
  user: process.env.DATABASE_USERNAME,
  host: process.env.DATABASE_URL,
  database: process.env.DATABASE_DB,
  password: process.env.DATABASE_PASSWORD,
  port: process.env.DATABASE_PORT,
  });  

module.exports = pool