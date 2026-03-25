## Skill Exchange Platform - Railway Deployment

This project is configured to deploy on Railway using Docker.

## Current setup decision

Database configuration is intentionally kept in code (hardcoded) as requested, in:

- `config/db.php`
- `assets/php/config.php`

No environment-driven DB changes are required.

## What was fixed for deployment

- Fixed `router.php` so it serves actual files in this repository and no longer points to missing `backend/public/index.php`.
- Updated `Dockerfile` to install `mysqli` (required by your API files).
- Updated `start.sh` to work with Railway `$PORT` reliably.
- Updated `Procfile` to use the shared startup script.

## Deploy on Railway

1. Push this repository to GitHub.
2. In Railway, create a new project from your GitHub repo.
3. Railway will detect the `Dockerfile` and build automatically.
4. Deploy and open the generated Railway URL.

## Optional local run

```bash
sh start.sh
```

Then open `http://localhost:8000`.

## Important production note

User uploads are stored in `uploads/`. Container local storage can be ephemeral on cloud platforms.

For durable files, add Railway volume storage (or external object storage).



