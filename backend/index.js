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
    'INSERT INTO users (email, password, user_name, tutorial_completed) VALUES ($1, $2, $3, $4) RETURNING user_id',
    [email, hashedPassword, userName, false]
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
  const cacheKey = `profile:${userId}`;

  let imgBuffer = null;
  let imgMime = null;
  if (req.files && req.files.pfp) {
    const imageFile = req.files.pfp;
    imgBuffer = imageFile.data;
    imgMime = imageFile.mimetype;
  }

  const pgClient = await pool.connect();
    try {
      await pgClient.query("BEGIN");

      let updateText, params;
      if (imgBuffer) {
        // With pfp
        updateText = `
          UPDATE users
          SET user_name = $1,
          bio = $2,
          contact_info = $3,
          pfp = $4,
          pfp_mime = $5
          WHERE user_id = $6
        `;
          params = [user_name, bio, contact_info, imgBuffer, imgMime, userId];
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
      await pgClient.query(updateText, params);
      await pgClient.query("COMMIT");
      await client.del(cacheKey);

      res.status(200).json({ message: "Profile picture updated successfully!" });
    } catch (dbErr) {
      await pgClient.query("ROLLBACK");
      console.error(dbErr);
      res.status(500).json({ error: "Database write failed." });
    } finally {
      pgClient.release();
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
    const cacheKey = `profile:${userId}`;

    const cached = await client.get(cacheKey);

    if (cached) {
      // Cache hit: parse the JSON and return immediately
      //console.log("Cache hit!");
      const profile = JSON.parse(cached);
      return res.status(200).json(profile);
    }

    // If miss, go directly to DB.
    const { rows } = await pool.query(
      `
      SELECT user_name,
      tutorial_completed,
      bio,
      contact_info,
      pfp,
      pfp_mime
      FROM users
      WHERE user_id = $1
      `,
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "User not found." });
    }

    const { user_name, tutorial_completed, bio, contact_info, pfp, pfp_mime } = rows[0];

    let pfpBase64 = null;
    if (pfp) {
      pfpBase64 = pfp.toString("base64");
    }

    const profile = {
      user_name,
      tutorial_completed,
      bio,
      contact_info,
      pfp: pfpBase64,
      pfp_mime,
    };

    await client.set(cacheKey, JSON.stringify(profile), {
      EX: 3600,
    });

    return res.status(200).json(profile);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error." });
  }
});

/* Retrieve User's Group Chores */
app.get("/getMyGroupTasks", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get group information
    const { rows: profileRows } = await pool.query(
      `
      SELECT
        p.group_id,
        g.name AS group_name
      FROM profiles p
      JOIN groups   g ON p.group_id = g.group_id
      WHERE p.user_id = $1
      `,
      [userId]
    );

    if (profileRows.length === 0) {
      return res.status(200).json({ inGroup: false });
    }

    const { group_id, group_name } = profileRows[0];

    // Fetch tasks
    const { rows: taskRows } = await pool.query(
      `
      SELECT
        task_id,
        description,
        due_date,
        point_worth,
        created_at,
        claimed_by,
        claimed_at,
        completed_at,
        is_completed
      FROM tasks
      WHERE group_id = $1
      ORDER BY due_date ASC NULLS LAST, created_at ASC
      `,
      [group_id]
    );

    // Serialize each task into a plain object
    const tasks = taskRows.map((t) => ({
      task_id:      t.task_id,
      description:  t.description,
      due_date:     t.due_date,         // “YYYY‐MM‐DD” (string) or null
      point_worth:  t.point_worth,
      created_at:   t.created_at,       // JS Date auto‐serialized to ISO
      claimed_by:   t.claimed_by,       // user_id of the claimer, or null if not claimed
      claimed_at:   t.claimed_at,       // JS Date or null if not claimed
      completed_at: t.completed_at,     // JS Date or null if not completed
      is_completed: t.is_completed      // boolean
    }));

    return res.status(200).json({
      inGroup: true,
      group: {
        group_id,
        group_name,
        tasks
      }
    });
  } catch (err) {
    console.error("Error in /getMyGroupTasks:", err);
    return res.status(500).json({ error: "Server error." });
  }
});

/* Group Creation API */
app.post("/createGroup", authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const { name } = req.body;

  // Validate that a group name was provided
  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return res.status(400).json({ error: "Group name is required." });
  }

  const pgClient = await pool.connect();
  try {
    await pgClient.query("BEGIN");

    // Insert into groups, returning the new group_id
    const insertGroupText = `
      INSERT INTO groups (owner_user_id, name)
      VALUES ($1, $2)
      RETURNING group_id, name
    `;
    const insertGroupValues = [userId, name.trim()];
    const {
      rows: [newGroup],
    } = await pgClient.query(insertGroupText, insertGroupValues);


    // Insert into profiles so that the creator automatically joins their own group
    const insertProfileText = `
      INSERT INTO profiles (user_id, group_id)
      VALUES ($1, $2)
      RETURNING profile_id
    `;
    const insertProfileValues = [userId, newGroup.group_id];
    await pgClient.query(insertProfileText, insertProfileValues);

    await pgClient.query("COMMIT");

    return res.status(201).json({
      message: "Group created successfully.",
      group: {
        group_id: newGroup.group_id,
        name: newGroup.name,
      },
    });
  } catch (err) {
    await pgClient.query("ROLLBACK");
    console.error("Error in /createGroup:", err);
    return res.status(500).json({ error: "Could not create group." });
  } finally {
    pgClient.release();
  }
});

/* Invite User API */
app.post("/inviteUser", authenticateToken, async (req, res) => {
  const invitedBy = req.user.userId;
  const { invited_user_email } = req.body;

  if (typeof invited_user_email !== "string" || !invited_user_email.trim()) {
    return res.status(400).json({
      error: "Please provide a non-empty invited_user_email in the request body.",
    });
  }
  const email = invited_user_email.trim().toLowerCase();

  try {
    // Find the group owned by this inviter
    const { rows: ownedGroups } = await pool.query(
      `SELECT group_id
         FROM groups
         WHERE owner_user_id = $1`,
      [invitedBy]
    );

    if (ownedGroups.length === 0) {
      return res
        .status(400)
        .json({ error: "You do not own any group to send invitations from." });
    }

    const group_id = ownedGroups[0].group_id;

    // Look up the invited user’s ID by email
    const {
      rows: [userRow],
    } = await pool.query(
      `SELECT user_id
         FROM users
         WHERE LOWER(email) = $1`,
      [email]
    );
    if (!userRow) {
      return res.status(404).json({
        error: "No user found with the provided email.",
      });
    }
    const invitedUserId = userRow.user_id;

    // Check that invited user is not already in the group
    const {
      rows: [alreadyMember],
    } = await pool.query(
      `SELECT 1
         FROM profiles
         WHERE user_id = $1
           AND group_id = $2`,
      [invitedUserId, group_id]
    );
    if (alreadyMember) {
      return res.status(400).json({
        error: "That user is already a member of your group.",
      });
    }

    // Check that there isn’t already an invitation (to prevent duplication)
    const {
      rows: [existingInvite],
    } = await pool.query(
      `SELECT 1
         FROM group_invitations
         WHERE group_id = $1
           AND invited_user_id = $2`,
      [group_id, invitedUserId]
    );
    if (existingInvite) {
      return res.status(400).json({
        error: "An invitation has already been sent to that user for your group.",
      });
    }

    // Insert the invitation
    const {
      rows: [newInvite],
    } = await pool.query(
      `
      INSERT INTO group_invitations (
        group_id,
        invited_by_user_id,
        invited_user_id
      ) VALUES ($1, $2, $3)
      RETURNING invite_id
      `,
      [group_id, invitedBy, invitedUserId]
    );

    return res.status(201).json({
      message: "Invitation sent successfully.",
      invite_id: newInvite.invite_id,
    });
  } catch (err) {
    console.error("Error in /inviteUser:", err);
    return res.status(500).json({ error: "Server error." });
  }
});