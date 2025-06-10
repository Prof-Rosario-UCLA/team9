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
const app = express();
const client = redis.createClient({
socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT
}
});
client.connect().catch(console.error);
const port = process.env.PORT
const cookieParser = require('cookie-parser');
const helmet  = require('helmet');

app.use(helmet());

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc:  ["'self'"],
    }
  })
);

/* Middleware setup */
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}))

app.use(fileUpload({
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
}));

app.use(express.json())

app.use(cookieParser());

app.listen(port, () => {
  console.log("server has started on port", port)
})

app.get("/ping", (req, res) => {
  res.status(200).send("pong");
});

/* Authenticate the session token created during registration or login */
function authenticateToken(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.sendStatus(401);
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.sendStatus(403);
    req.user = { userId: decoded.userId, email: decoded.email };
    next();
  });
}

//module.exports = pool

/* Signup endpoint */
app.post('/signup', async (req, res) => {
const { userName, email, password} = req.body 

if (!email || !password || !userName) {
  return res.status(400).json({ error: "Email, password, and username are required." })
}

const pgClient = await pool.connect() 

try {
  // Start transaction
  await pgClient.query('BEGIN') 

  const existingUser = await pgClient.query(
    'SELECT email FROM users WHERE email = $1', [email]
  )

  if (existingUser.rows.length > 0) {
    await pgClient.query('ROLLBACK')
    return res.status(409).json({ error: "Email already exists." })
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  const newUser = await pgClient.query(
    'INSERT INTO users (email, password, user_name, tutorial_completed) VALUES ($1, $2, $3, $4) RETURNING user_id',
    [email, hashedPassword, userName, false]
  )

  const user_id = newUser.rows[0].user_id

  // Commit transaction
  await pgClient.query('COMMIT') 

  const token = jwt.sign(
    { userId: user_id, email },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  )

 res.cookie('token', token, {
     httpOnly: true,
     secure: true,
     sameSite: 'lax',
     maxAge: 3600 * 1000,
   })
   .status(201)
   .json({ success: true });
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

  res.cookie('token', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge:   3600 * 1000,
  })
  .status(201)
  .json({ success: true });
} catch (err) {
  console.error(err)
  res.status(500).send("Server Error")
}
console.log("Successful login")
})

/* Clears Cookie to Log Out */
app.post('/logout', (req, res) => {
  res.clearCookie('token', {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path:     '/',
    })
    .status(200)
    .json({ success: true });
});

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

    const { rows } = await pool.query(
      `SELECT group_id
         FROM profiles
         WHERE user_id = $1`,
      [userId]
    );
    if (rows.length) {
      const groupId = rows[0].group_id;
      await client.del(`myGroupTasks:${groupId}`);
      await client.del(`groupLeaderboard:${groupId}`);
      await client.del(`groupMembers:${groupId}`);
    }

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
    const cacheKey = `myGroupTasks:${group_id}`;

    const cached = await client.get(cacheKey);
    if (cached) {
      const tasks = JSON.parse(cached);
      return res.status(200).json({
        inGroup: true,
        group: { group_id, group_name, tasks }
      });
    }

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
      due_date:     t.due_date,
      point_worth:  t.point_worth,
      created_at:   t.created_at,
      claimed_by:   t.claimed_by,
      claimed_at:   t.claimed_at,
      completed_at: t.completed_at,
      is_completed: t.is_completed
    }));

    await client.set(cacheKey, JSON.stringify(tasks), { EX: 300 });

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

    await client.del(`invitations:${invitedUserId}`);

    return res.status(201).json({
      message: "Invitation sent successfully.",
      invite_id: newInvite.invite_id,
    });
  } catch (err) {
    console.error("Error in /inviteUser:", err);
    return res.status(500).json({ error: "Server error." });
  }
});

/* Retrieves Group Invitations of Current User */
app.get("/getInvitations", authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const cacheKey = `invitations:${userId}`;

  try {
    const cached = await client.get(cacheKey);
    if (cached) {
      // Cache hit
      const parsed = JSON.parse(cached);
      return res.status(200).json({ invitations: parsed });
    }

    // Query for all invitations where this user is the invitee
    const { rows: invitations } = await pool.query(
      `
      SELECT
        gi.invite_id,
        gi.group_id,
        g.name AS group_name,
        gi.invited_by_user_id,
        inviter.user_name  AS invited_by_name,
        inviter.email      AS invited_by_email
      FROM group_invitations gi
      JOIN groups g
        ON gi.group_id = g.group_id
      JOIN users inviter
        ON gi.invited_by_user_id = inviter.user_id
      WHERE gi.invited_user_id = $1
      ORDER BY gi.invite_id DESC
      `,
      [userId]
    );

    // Array of invitation objects
    const result = invitations.map((inv) => ({
      invite_id:         inv.invite_id,
      group_id:          inv.group_id,
      group_name:        inv.group_name,
      invited_by_user_id:  inv.invited_by_user_id,
      invited_by_name:   inv.invited_by_name,
      invited_by_email:  inv.invited_by_email
    }));

    await client.set(cacheKey, JSON.stringify(result), {
      EX: 300
    });

    // Return the array or empty if there is no invitations found
    return res.status(200).json({ invitations: result });
  } catch (err) {
    console.error("Error in /getInvitations:", err);
    return res.status(500).json({ error: "Server error." });
  }
});

/* Accepts Group Invitation */
app.post("/acceptInvite", authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const { group_id } = req.body;

  if (typeof group_id !== "number") {
    return res.status(400).json({ error: "Missing or invalid group_id in request body." });
  }

  // Get a client for transaction
  const pgClient = await pool.connect();
  try {
    await pgClient.query("BEGIN");

    // Ensures invite is actually there
    const { rows: inviteRows } = await pgClient.query(
      `
      SELECT 1
      FROM group_invitations
      WHERE invited_user_id = $1
        AND group_id = $2
      `,
      [userId, group_id]
    );
    if (inviteRows.length === 0) {
      await pgClient.query("ROLLBACK");
      return res.status(400).json({ error: "No pending invitation found for that group." });
    }

    // Delete all invitations for this user
    await pgClient.query(
      `
      DELETE FROM group_invitations
      WHERE invited_user_id = $1
      `,
      [userId]
    );

    // Insert into profiles to signify the user joined the group
    await pgClient.query(
      `
      INSERT INTO profiles (user_id, group_id)
      VALUES ($1, $2)
      `,
      [userId, group_id]
    );

    await pgClient.query("COMMIT");

    await client.del(`invitations:${userId}`);
    await client.del(`groupMembers:${group_id}`);
    await client.del(`groupLeaderboard:${group_id}`);

    return res.status(200).json({ message: "Invitation accepted. You have joined the group." });
  } catch (err) {
    await pgClient.query("ROLLBACK");

    if (err.code === "23505") {
      // UNIQUE violation
      return res.status(400).json({ error: "You are already a member of that group." });
    }

    console.error("Error in /acceptInvite:", err);
    return res.status(500).json({ error: "Server error." });
  } finally {
    pgClient.release();
  }
});

/* Retrieve All Group Members of the Group the User's in */
app.get("/getGroupMembers", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Find the group_id through the authToken
    const { rows: profileRows } = await pool.query(
      `SELECT group_id
         FROM profiles
         WHERE user_id = $1`,
      [userId]
    );

    if (profileRows.length === 0) {
      // If not in a group
      return res.status(200).json({ inGroup: false });
    }

    const groupId = profileRows[0].group_id;
    const cacheKey = `groupMembers:${groupId}`;

    const cached = await client.get(cacheKey);
    if (cached) {
      // Cache hit
      const members = JSON.parse(cached);
      return res.status(200).json({ inGroup: true, members });
    }

    const { rows: groupRows } = await pool.query(
      `SELECT name FROM groups WHERE group_id = $1`,
      [groupId]
    );
    const groupName = groupRows[0].name;

    // Fetch all members of that group
    const { rows: memberRows } = await pool.query(
      `
      SELECT
        u.user_id,
        u.user_name,
        u.email,
        u.bio,
        u.contact_info,
        u.pfp,
        u.pfp_mime,
        p.points
      FROM profiles p
      JOIN users u
        ON p.user_id = u.user_id
      WHERE p.group_id = $1
      `,
      [groupId]
    );

    // Serialize each member
    const members = memberRows.map((m) => {
      let pfpBase64 = null;
      if (m.pfp) {
        pfpBase64 = m.pfp.toString("base64");
      }
      return {
        user_id:      m.user_id,
        user_name:    m.user_name,
        email:        m.email,
        bio:          m.bio,
        contact_info: m.contact_info,
        pfp:          pfpBase64,
        pfp_mime:     m.pfp_mime,
        points:       m.points,
        groupName
      };
    });

    await client.set(cacheKey, JSON.stringify(members), {
      EX: 300
    });

    // Return array of members
    return res.status(200).json({
      inGroup: true,
      members
    });
  } catch (err) {
    console.error("Error in /getGroupMembers:", err);
    return res.status(500).json({ error: "Server error." });
  }
});

/* Leave Group API */
app.post("/leaveGroup", authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const pgClient = await pool.connect();

  try {
    await pgClient.query("BEGIN");

    // Find the group_id that this user belongs to
    const {
      rows: [profileRow],
    } = await pgClient.query(
      `SELECT group_id
         FROM profiles
         WHERE user_id = $1`,
      [userId]
    );

    if (!profileRow) {
      await pgClient.query("ROLLBACK");
      return res.status(400).json({ error: "You are not in a group." });
    }

    const groupId = profileRow.group_id;

    // Check if the user is the owner of that group
    const {
      rows: [groupRow],
    } = await pgClient.query(
      `SELECT owner_user_id
         FROM groups
         WHERE group_id = $1`,
      [groupId]
    );

    const isOwner = groupRow.owner_user_id === userId;

    if (isOwner) {
      // If owner, delete the group itself
      await pgClient.query(
        `DELETE FROM groups
           WHERE group_id = $1`,
        [groupId]
      );
    } else {
      // If not owner, simply remove the profile row, which signifies a leave group.
      await pgClient.query(
        `DELETE FROM profiles
           WHERE user_id = $1
             AND group_id = $2`,
        [userId, groupId]
      );
    }

    await pgClient.query("COMMIT");
    await client.del(`myGroupTasks:${groupId}`);
    await client.del(`groupLeaderboard:${groupId}`);

    if (isOwner) {
      return res
        .status(200)
        .json({ message: "You left and deleted the group successfully." });
    } else {
      return res
        .status(200)
        .json({ message: "You have left the group successfully." });
    }
  } catch (err) {
    await pgClient.query("ROLLBACK");
    console.error("Error in /leaveGroup:", err);
    return res.status(500).json({ error: "Server error." });
  } finally {
    pgClient.release();
  }
});

/* Create Chore API */
app.post("/createTask", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    // Find which group this user is in
    const {
      rows: profileRows,
    } = await pool.query(
      `SELECT group_id
         FROM profiles
         WHERE user_id = $1`,
      [userId]
    );
    
    // If not in group
    if (profileRows.length === 0) {
      return res.status(200).json({ inGroup: false });
    }

    const groupId = profileRows[0].group_id;

    // Extract and validate input from body
    const { description, due_date, point_worth } = req.body;

    if (!description || typeof description !== "string" || !description.trim()) {
      return res
        .status(400)
        .json({ error: "description is required and must be a non-empty string." });
    }

    // due_date
    if (due_date) {
      const parsed = new Date(due_date);
      if (Number.isNaN(parsed.getTime())) {
        return res
          .status(400)
          .json({ error: "Form not fully filled out" });
      }
      dueDateValue = parsed.toISOString(); 
    }

    // point_worth
    if (point_worth !== undefined) {
      const pv = Number(point_worth);
      if (Number.isNaN(pv) || !Number.isInteger(pv) || pv < 0) {
        return res
          .status(400)
          .json({ error: "Points must be a non-negative integer" });
      }
      pointsValue = pv;
    }

    const insertQuery = `
      INSERT INTO tasks (group_id, description, due_date, point_worth)
      VALUES ($1, $2, $3, $4)
      RETURNING task_id, group_id, description, due_date, point_worth, created_at, is_completed
    `;
    const insertValues = [groupId, description.trim(), dueDateValue, pointsValue];

    const {
      rows: [newTask],
    } = await pool.query(insertQuery, insertValues);

    await client.del(`myGroupTasks:${groupId}`);

    return res.status(201).json({
      message: "Task created successfully",
      task: newTask,
    });
  } catch (err) {
    console.error("Error in /createTask:", err);
    return res.status(500).json({ error: "Server error." });
  }
});

/* Claim Chores API */
app.post("/claimTasks", authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const { task_ids } = req.body;

  // Validate input
  if (
    !Array.isArray(task_ids) ||
    task_ids.length === 0 ||
    !task_ids.every((id) => Number.isInteger(id) && id > 0)
  ) {
    return res
      .status(400)
      .json({ error: "task_ids must be a non-empty array of positive integers." });
  }

  try {
    // Get user_id for claimed_by
    const {
      rows: [profileRow],
    } = await pool.query(
      `SELECT profile_id, group_id
         FROM profiles
         WHERE user_id = $1`,
      [userId]
    );

    if (!profileRow) {
      // if not in a group
      return res.status(200).json({ inGroup: false });
    }
    const profileId = profileRow.profile_id;
    const groupId = profileRow.group_id;

    // Update row
    const { rowCount } = await pool.query(
      `
      UPDATE tasks
      SET claimed_by = $1,
          claimed_at = NOW()
      WHERE task_id = ANY($2::int[])
      `,
      [profileId, task_ids]
    );

    await client.del(`myGroupTasks:${groupId}`);

    // Return how many were updated
    return res.status(200).json({
      claimedCount: rowCount,
      claimed_task_ids: task_ids
    });
  } catch (err) {
    console.error("Error in /claimTasks:", err);
    return res.status(500).json({ error: "Server error." });
  }
});

/* Marks Task as Complete */
app.post("/completeTasks", authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const { task_ids } = req.body;

  // Validate input
  if (
    !Array.isArray(task_ids) ||
    task_ids.length === 0 ||
    !task_ids.every(id => Number.isInteger(id) && id > 0)
  ) {
    return res.status(400).json({
      error: "task_ids must be a non-empty array of positive integers."
    });
  }

  const pgClient = await pool.connect();
  try {
    await pgClient.query("BEGIN");

    // Get user profile and group
    const {
      rows: [profileRow],
    } = await pgClient.query(
      `SELECT profile_id, group_id
         FROM profiles
         WHERE user_id = $1`,
      [userId]
    );

    if (!profileRow) {
      await pgClient.query("ROLLBACK");
      return res.status(200).json({ inGroup: false });
    }
    const { profile_id: profileId, group_id: groupId } = profileRow;

    // Fetch points for those tasks
    const { rows: pointsRows } = await pgClient.query(
      `
      SELECT point_worth
      FROM tasks
      WHERE task_id = ANY($1::int[])
        AND claimed_by = $2
        AND NOT is_completed
      `,
      [task_ids, profileId]
    );

    if (pointsRows.length === 0) {
      await pgClient.query("ROLLBACK");
      return res.status(400).json({ error: "No eligible tasks to complete." });
    }
    const totalPoints = pointsRows.reduce((sum, r) => sum + r.point_worth, 0);

    const { rowCount } = await pgClient.query(
      `
      UPDATE tasks
      SET is_completed = TRUE,
          completed_at = NOW()
      WHERE task_id = ANY($1::int[])
        AND claimed_by = $2
      `,
      [task_ids, profileId]
    );

    // Add points to the profile
    await pgClient.query(
      `
      UPDATE profiles
      SET points = points + $1
      WHERE profile_id = $2
      `,
      [totalPoints, profileId]
    );

    await client.del(`myGroupTasks:${groupId}`);
    await client.del(`groupLeaderboard:${groupId}`);

    await pgClient.query("COMMIT");

    return res.status(200).json({
      completedCount: rowCount,
      completed_task_ids: task_ids,
      pointsAwarded: totalPoints
    });
  } catch (err) {
    await pgClient.query("ROLLBACK");
    console.error("Error in /completeTasks:", err);
    return res.status(500).json({ error: "Server error." });
  } finally {
    pgClient.release();
  }
});

/* Retrieves Group Leaderboard */
app.get("/groupLeaderboard", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get the group this user belongs to
    const { rows: profileRows } = await pool.query(
      `SELECT group_id
         FROM profiles
         WHERE user_id = $1`,
      [userId]
    );

    if (profileRows.length === 0) {
      // If not in group
      return res.status(200).json({ inGroup: false });
    }

    const groupId = profileRows[0].group_id;
    const cacheKey = `groupLeaderboard:${groupId}`;

    const cached = await client.get(cacheKey);
    if (cached) {
      const leaderboard = JSON.parse(cached);
      return res.status(200).json({ inGroup: true, groupId, leaderboard });
    }

    // Fetch all profiles in that group, joined with user info, sorted by points in descending
    const { rows: rawRows } = await pool.query(
      `
      SELECT
        p.user_id,
        u.user_name,
        u.email,
        u.pfp,
        u.pfp_mime,
        p.points
      FROM profiles p
      JOIN users    u ON p.user_id = u.user_id
      WHERE p.group_id = $1
      ORDER BY p.points DESC, u.user_name ASC
      `,
      [groupId]
    );

    const leaderboard = rawRows.map(r => {
      let pfpBase64 = null;
      if (r.pfp) {
        pfpBase64 = r.pfp.toString("base64");
      }
      return {
        user_id:   r.user_id,
        user_name: r.user_name,
        email:     r.email,
        points:    r.points,
        pfp:       pfpBase64,
        pfp_mime:  r.pfp_mime
      };
    });

    await client.set(cacheKey, JSON.stringify(leaderboard), { EX: 300 });

    return res.status(200).json({
      inGroup: true,
      groupId,
      leaderboard
    });
  } catch (err) {
    console.error("Error in /groupLeaderboard:", err);
    return res.status(500).json({ error: "Server error." });
  }
});

/* Marks Tutorial as Completed */
app.post("/completeTutorial", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const { rowCount } = await pool.query(
      `UPDATE users
         SET tutorial_completed = TRUE
       WHERE user_id = $1`,
      [userId]
    );

    if (rowCount === 0) {
      return res.status(404).json({ error: "User not found." });
    }

    await client.del(`profile:${userId}`);

    // 3) Return success
    return res.status(200).json({ tutorial_completed: true });
  } catch (err) {
    console.error("Error in /completeTutorial:", err);
    return res.status(500).json({ error: "Server error." });
  }
});

const DIST_DIR = path.join(__dirname, 'dist');
app.use(express.static(DIST_DIR));

// Fallback route for React Router
app.get('*', (req, res) => {
  res.sendFile(path.join(DIST_DIR, 'index.html'));
});
