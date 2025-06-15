#!/bin/bash

echo "[$(date)] Starting services..."

# Start PM2 with the Node.js app
pm2 start index.js --name stock-monitor

# Start ngrok in background
ngrok http --url=engaging-purely-rabbit.ngrok-free.app 3000 &
NGROK_PID=$!

echo "[$(date)] Services started. PID of ngrok: $NGROK_PID"

# Sleep for 8 hours
echo "[$(date)] Will run for 8 hours..."
sleep 28800

# Stop everything
echo "[$(date)] 8 hours elapsed. Stopping services..."
kill $NGROK_PID
pm2 stop all
pm2 delete all

echo "[$(date)] All services stopped."
