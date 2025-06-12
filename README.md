# How to Run

# Frontend React/Vite

1. Go into the frontend directory.
2. Run npm install.
3. Run npm run build to download static files.

# Backend Express

1. Go into the backend directory.
2. Run npm install..

# Google App Engine Deployment

1. Go into the backend directory.
2. Create an app.yaml file
3. In it, fill it with the following information. For env_variables, type in your own redis and psql server information.

runtime: nodejs22  
env: standard  
instance_class: F1  

automatic_scaling:  
  min_instances: 1  
  max_instances: 1  

env_variables:  
  NODE_ENV: "production"  
  PORT: "8080"  
  JWT_SECRET: (insert)  
  DATABASE_URL: (insert)  
  DATABASE_USERNAME: (insert)  
  DATABASE_PASSWORD: (insert)  
  DATABASE_DB: (insert)  
  DATABASE_PORT: (insert)  
  REDIS_HOST: (insert)  
  REDIS_PORT: (insert)  

entrypoint: node index.js  

4. Run gcloud app deploy in the backend directory.

# API Endpoints

/signup - Requires username, email, and password as arguments. Uses bcrypt to encrypt passwords and stores information in a new user table row. Also creates a jwt token with 1 hour expiration, which has username and user_id and email. In addition, it creates a cookie with the token.  

/login - Requires email and password as arguments. Checks if the user exists, if they do, they compare the password of the given arguments to the one in the database. If they match, we return a cookie with an authentication token.  

/logout - Simply clears the cookie of the user  

/uploadBio - retrieves user_id from authentication token, username, bio text, and contact info text. Deletes previous cache, to allow for updated information. If not, query the database and update rows in the user table. Return message of success, if successful.  

/getProfile - retrieves user info from user_id through the authentication token. First check cache to see if it has been cached before. If not, query to the database to retrieve information about the user. Then, save to the cache and return the information through a JSON object.  

/getMyGroupTasks - retrieves user_id from the authentication token. Retrieves the group the user is in (if any). Then checks the cache to see if it has been cached. If not, query to the database and get the information. Save to the cache and return the information through a JSON object.  

/createGroup - retrieves user_id from the authentication token and receives the name of the group through the arguments. Creates a new table with the new group.  

/inviteUser - retrieves user_id from the authentication token and receives the email the user wants to invite through the arguments. Gets the group id of the inviter and user_id of the invited. We then create a new row that signifies the invitation.  

/getInvitations - retrieves user_id from the authentication token. Then queries the invitation table to look for all invites that invite the user. Sends it back through a JSON file.  

/acceptInvite - retrieves user_id from the authentication token. Also gets a group_id from the arguments. First ensures the invitation is still there, then deletes all invitations of that user, and creates a new profile row, signifying the user joined the group. Returns a success message.  

/getGroupMembers - retrieves user_id from the authentication token. First checks cache to see if it’s there. If not, query to look for all users in the group through the profile table. Retrieves info of all the users, and returns it in a JSON object.  

/leaveGroup - retrieve user_id from the authentication token. Removes the row from the profile table. Also deletes cache info, for it to update. Returns a JSON object if successful or not.  

/createTask - retrieves user_id from the authentication token. Retrieves description, due date, and points worth from arguments. Queries to the tasks table and removes cache, to allow for it to update. Returns JSON object if successful or not.  

/claimTask - retrieves user_id from the authentication token. Retrieves task id from the arguments. Makes sure the user is in the group and the task exists. If it is, update the row to have the claimed_by column updated. Also deletes cache to have it updated. Returns a JSON object if successful or not.  

/completeTask - similar to claimTask, however, this time, it ensures the user already claimed the task. If true, updates the is_completed and completed_at columns. Deletes cache to have it updated. Returns JSON object if successful or not.  

/groupLeaderboard - retrieves user_id from the authentication token. Checks if the user is in a group or not. If they are, get all profiles of the same group_id. Then return their information in a JSON object. This is also cached.  

/completeLeaderboard - retrieves user_id from the authentication token. Sets the row of the user’s tutorial_completed column to true. Also clears cache to allow it to update. Returns a JSON object if successful or not.  
