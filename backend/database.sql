-- Users and authentication
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    user_name TEXT NOT NULL,
    tutorial_completed BOOLEAN NOT NULL,
    bio TEXT,
    contact_info TEXT,
    pfp bytea,
    pfp_mime TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Groups
CREATE TABLE groups (
    group_id SERIAL PRIMARY KEY,
    owner_user_id INT REFERENCES users(user_id) ON DELETE CASCADE, 
    name TEXT NOT NULL
);

-- User profiles
CREATE TABLE profiles (
    profile_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    group_id INT REFERENCES groups(group_id) ON DELETE CASCADE,
    points INT DEFAULT 0,
    UNIQUE(user_id, group_id)
);

-- Tasks
CREATE TABLE tasks (
    task_id SERIAL PRIMARY KEY,
    group_id INT REFERENCES groups(group_id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    due_date TIMESTAMPTZ,
    point_worth INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    claimed_by INT REFERENCES profiles(profile_id) ON DELETE SET NULL,
    claimed_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    is_completed BOOLEAN DEFAULT FALSE
);

-- Invitations
CREATE TABLE group_invitations (
    invite_id SERIAL PRIMARY KEY,
    group_id INT REFERENCES groups(group_id) ON DELETE CASCADE,
    invited_by_user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    invited_user_id INT REFERENCES users(user_id) ON DELETE SET NULL
);