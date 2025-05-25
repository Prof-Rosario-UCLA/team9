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

app.use(cors({
    origin: "http://localhost:1919",
}))
app.use(fileUpload({
limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
useTempFiles: true,
tempFileDir: '/tmp/'
}));
app.use(express.json())

