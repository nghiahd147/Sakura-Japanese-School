#!/bin/bash
# Railway start script
PORT=${PORT:-8080}
echo "Starting PHP server on port $PORT"
php -S 0.0.0.0:$PORT -t frontend/