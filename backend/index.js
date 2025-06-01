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

/* Middleware setup */
app.use(cors({
    origin: "http://localhost:5173",
}))
app.use(fileUpload({
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    useTempFiles: true,
    tempFileDir: '/tmp/'
}));
app.use(express.json())

app.listen(port, () => {
  console.log("server has started on port", port)
})

/* Authenticate the session token created during registration or login */
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

/* Signup endpoint */
app.post('/signup', async (req, res) => {
const { userName, email, password} = req.body 

if (!email || !password || !userName) {
  return res.status(400).json({ error: "Email, password, and username are required." })
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
    'INSERT INTO users (email, password, user_name) VALUES ($1, $2, $3) RETURNING user_id',
    [email, hashedPassword, userName]
  )

  const user_id = newUser.rows[0].person_id

  // Commit transaction
  await client.query('COMMIT') 

  const token = jwt.sign(
    { user_id, email },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  )

  res.status(201).json({ token })
  console.log("User created")

} catch (err) {
  await client.query('ROLLBACK') 
  console.error(err)
  res.status(500).json({ error: "Internal server error." })
} finally {
  client.release() 
}
})

/* Login endpoint */
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
    { userId: user.user_id, email: user.email },
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

/* Upload Profile Picture */
app.post("/uploadBio", authenticateToken, async (req, res) => {
try {
  const userId = req.user.userId;
  const { user_name, bio, contact_info } = req.body;

  let imgBuffer = null;
  if (req.files && req.files.pfp) {
    const imageFile = req.files.pfp;
    imgBuffer = imageFile.data;
  }

  const client = await pool.connect();
    try {
      await client.query("BEGIN");
      let updateText, params;
      if (imgBuffer) {
        // With pfp
        updateText = `
          UPDATE users
          SET user_name = $1,
          bio = $2,
          contact_info = $3,
          pfp = $4
          WHERE user_id = $5
        `;
        params = [user_name, bio, contact_info, imgBuffer, userId];
      } else {
        // No pfp
        updateText = `
          UPDATE users
          SET user_name = $1,
          bio = $2,
          contact_info = $3
          WHERE user_id = $4
        `;
        params = [user_name, bio, contact_info, userId];
      }
      await client.query(updateText, params);
      await client.query("COMMIT");
      res.status(200).json({ message: "Profile picture updated successfully!" });
    } catch (dbErr) {
      await client.query("ROLLBACK");
      console.error(dbErr);
      res.status(500).json({ error: "Database write failed." });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

/* Retrieve Profile Information */
app.get("/getProfile", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const { rows } = await pool.query(
      `
      SELECT user_name,
      bio,
      contact_info,
      pfp
      FROM users
      WHERE user_id = $1
      `,
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "User not found." });
    }

    const { user_name, bio, contact_info, pfp } = rows[0];

    let pfpBase64 = null;
    if (pfp) {
      pfpBase64 = pfp.toString("base64");
    }

    // Send everything as JSON
    return res.status(200).json({
      user_name,
      bio,
      contact_info,
      pfp: pfpBase64, // null or “iVBORw0KGgoAAAANSUhE…” (Base64 string)
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error." });
  }
});

