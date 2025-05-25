#!/bin/bash
rm -rf node_modules package-lock.json
npm install

redis-server &
sleep 2
nodemon dev