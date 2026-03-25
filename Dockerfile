FROM php:8.2-cli

# Install MySQL extensions used by the project
RUN docker-php-ext-install mysqli pdo pdo_mysql

# Set working directory
WORKDIR /app

# Copy all project files
COPY . /app

# Prepare writable runtime directories
RUN chmod +x /app/start.sh \
	&& mkdir -p /tmp/php-sessions \
	&& mkdir -p /app/uploads/assignments \
	&& mkdir -p /app/uploads/certificates \
	&& mkdir -p /app/uploads/profile_pictures \
	&& mkdir -p /app/uploads/submissions \
	&& mkdir -p /app/uploads/videos \
	&& chmod -R 775 /tmp/php-sessions /app/uploads

# Expose default app port (Railway will set $PORT at runtime)
EXPOSE 8000

# Start app
CMD ["sh", "/app/start.sh"]
