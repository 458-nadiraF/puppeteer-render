#!/bin/bash

# Start the Node.js application with pm2
pm2 start /usr/src/app/index.js

# Start ngrok with the desired port (3000 in this case)
ngrok http --url=engaging-purely-rabbit.ngrok-free.app 3000
