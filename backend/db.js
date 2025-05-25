require('dotenv').config()
const { Pool } = require('pg')
console.log("Loaded DATABASE_URL:", process.env.DATABASE_URL);

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });  

module.exports = pool