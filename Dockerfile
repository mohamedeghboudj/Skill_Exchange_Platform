FROM php:8.2-cli

# Install PDO MySQL extension
RUN docker-php-ext-install pdo pdo_mysql

# Set working directory
WORKDIR /app

# Copy all project files
COPY . /app

# Create sessions directory (writable)
RUN mkdir -p /app/backend/sessions && chmod 777 /app/backend/sessions
RUN mkdir -p /app/storage/logs && chmod 777 /app/storage/logs
RUN mkdir -p /app/storage/profile_pictures && chmod 777 /app/storage/profile_pictures

# Expose port (Railway injects $PORT, default 8000)
EXPOSE ${PORT:-8000}

# Start PHP built-in server
CMD php -S 0.0.0.0:${PORT:-8000} router.php
