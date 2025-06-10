# How to Run

# Frontend React/Vite

1. Go into the frontend directory.
2. Run npm install
3. Run npm run build to download static files.

# Backend Express

1. Go into the backend directory.
2. Run npm install.

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
  JWT_SECRET: <insert>
  DATABASE_URL: <insert>
  DATABASE_USERNAME: <insert>
  DATABASE_PASSWORD: <insert>
  DATABASE_DB: <insert>
  DATABASE_PORT: <insert>
  REDIS_HOST: <insert>
  REDIS_PORT: <insert>

entrypoint: node index.js

4. Run gcloud app deploy in the backend directory.