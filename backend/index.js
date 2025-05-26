const express = require('express')
const cors = require('cors')
const path = require('path')
const fs = require('fs')
const { exec } = require('child_process')
const fileUpload = require('express-fileupload')
const pool = require('./db')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const redis = require("redis");
require('dotenv').config()
const app = express()
const client = redis.createClient();
client.connect().catch(console.error);
const port = process.env.PORT

// Middleware setup
app.use(cors({
    origin: "http://localhost:5173",
}))
app.use(fileUpload({
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    useTempFiles: true,
    tempFileDir: '/tmp/'
}));
app.use(express.json())

// Authenticate the session token created during registration or login
function authenticateToken(req, res, next) {
const authHeader = req.headers['authorization']
const token = authHeader && authHeader.split(' ')[1]
if (!token) return res.sendStatus(401)
jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
  if (err) return res.sendStatus(403)
  //console.log("Decoded User:", user);
  req.user = user
  next()
})
}

module.exports = pool

// Signup endpoint
app.post('/signup', async (req, res) => {
const { email, password} = req.body 

if (!email || !password) {
  return res.status(400).json({ error: "Email and password are required." })
}

const client = await pool.connect() 

try {
  // Start transaction
  await client.query('BEGIN') 

  const existingUser = await client.query(
    'SELECT email FROM users WHERE email = $1', [email]
  )

  if (existingUser.rows.length > 0) {
    await client.query('ROLLBACK')
    return res.status(409).json({ error: "Email already exists." })
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  const newUser = await client.query(
    'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING user_id',
    [email, hashedPassword]
  )

  const user_id = newUser.rows[0].user_id

  await client.query(
    'INSERT INTO profiles (user_id) VALUES ($1)',
    [user_id]
  )

  // Commit transaction
  await client.query('COMMIT') 

  const token = jwt.sign(
    { user_id, email },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  )

  res.status(201).json({ token })
  console.log("User and Profile created")

} catch (err) {
  await client.query('ROLLBACK') 
  console.error(err)
  res.status(500).json({ error: "Internal server error." })
} finally {
  client.release() 
}
})

// Login endpoint
app.post('/login', async (req, res) => {
const { email, password } = req.body

try {
  const userResult = await pool.query(
    'SELECT user_id, email, password FROM users WHERE email = $1',
    [email]
  )

  if (userResult.rows.length === 0) {
    return res.status(401).json({ error: 'User not found' })
  }

  const user = userResult.rows[0]
  const isMatch = await bcrypt.compare(password, user.password)

  if (!isMatch) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }

  const token = jwt.sign(
    { userId: user.person_id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  )
  res.json({ token })
} catch (err) {
  console.error(err)
  res.status(500).send("Server Error")
}
console.log("Successful login")
})

