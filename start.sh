#!/bin/sh
set -e

PORT="${PORT:-8000}"
mkdir -p /tmp/php-sessions \
  /app/uploads/assignments \
  /app/uploads/certificates \
  /app/uploads/profile_pictures \
  /app/uploads/submissions \
  /app/uploads/videos

exec php -d session.save_path=/tmp/php-sessions -S 0.0.0.0:"$PORT" router.php
