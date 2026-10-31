# Task Manager

A local task-management application built with React, PHP, and MariaDB. Docker Compose runs the frontend, API, and database together; MariaDB data is kept in a named volume.

## What it does

- View tasks, including their descriptions, status, and creation time.
- Create tasks with a title and optional description.
- Mark tasks complete or pending.
- Delete tasks.

## Stack and services

| Service | Technology | Local address |
| --- | --- | --- |
| `web` | React 19, Vite, Node.js 20 | <http://localhost:5173> |
| `backend` | PHP 8.2, Apache, PDO MySQL | <http://localhost:8000> |
| `db` | MariaDB | `localhost:3306` by default |

The frontend calls the PHP API at `/api/tasks.php`. The API connects to MariaDB using the Compose service name `db`; containers communicate over Compose's private network.

## Prerequisites

- Docker Engine or Docker Desktop with the Compose plugin.
- Ports `5173`, `8000`, and (by default) `3306` available on your machine.

## Start the application

Run these commands from this directory (`assesment-3`):

```bash
cp .env.example .env
```

Edit `.env` if needed. The example values are suitable for local development; change `DB_PASSWORD` before using the setup in any shared or exposed environment. Keep `.env` private and do not commit real credentials.

Build and start all services:

```bash
docker compose up --build -d
```

Open <http://localhost:5173> in a browser. The backend is available at <http://localhost:8000>, and the task API endpoint is <http://localhost:8000/api/tasks.php>.

Check service status and logs:

```bash
docker compose ps
docker compose logs -f
```

To follow logs for just one service, use `docker compose logs -f web`, `docker compose logs -f backend`, or `docker compose logs -f db`.

## Environment configuration

The root `.env` file is read by Compose for variable substitution and supplied to the backend container. The database receives the MariaDB settings it needs.

| Variable | Purpose | Default in `.env.example` |
| --- | --- | --- |
| `HOST` | MariaDB hostname used by the PHP API; use the Compose service name. | `db` |
| `DB_NAME` | Database created by MariaDB and used by the API. It must remain `task_manager` for the supplied schema. | `task_manager` |
| `DB_PASSWORD` | MariaDB root password used by the API and database health check. | `change-this-local-password` |
| `DB_PORT` | Host port mapped to MariaDB's container port `3306`. | `3306` |

If `3306` is already in use, set `DB_PORT` to another available host port (for example `3307`). The application still connects to MariaDB internally on `db:3306`.

## Data persistence and database initialization

Compose stores database files in the named volume `db_data`, so task data survives container restarts and rebuilds. `database/schema.sql` is mounted into MariaDB's initialization directory and creates the `tasks` table when MariaDB initializes a new, empty data directory. Changing the SQL file later does not re-run it against an existing volume.

To stop the services without deleting data:

```bash
docker compose down
```

To permanently remove the database and all saved tasks, remove the volume as well:

```bash
docker compose down --volumes
```

The volume removal is destructive. MariaDB will recreate the database and apply the initialization script the next time the services start.

## API

All routes use `http://localhost:8000/api/tasks.php`:

| Method | Operation | Input |
| --- | --- | --- |
| `GET` | List tasks, newest first. | None |
| `POST` | Create a task. | JSON such as `{"title":"Example","description":"Optional details"}` |
| `PUT` | Update a task, including its status. | JSON containing `id`, `title`, `description`, and `status` (`pending` or `completed`) |
| `DELETE` | Delete a task. | `?id=<task-id>` |

## Development checks

Run the frontend lint and production build inside the running web container:

```bash
docker compose exec web npm run lint
docker compose exec web npm run build
```

The frontend source is under `frontend/src`, PHP API/configuration is under `backend`, and the initial database schema is under `database`.

## Troubleshooting

- **Compose reports a missing `.env`:** copy `.env.example` to `.env` before starting the services.
- **The backend cannot connect to MariaDB:** check `docker compose logs db backend`, confirm `HOST=db`, and wait for the database health check to pass.
- **The database port is unavailable:** choose another `DB_PORT` in `.env`; do not change the internal MariaDB port.
- **Schema changes are not visible:** initialization scripts only run when MariaDB starts with an empty `db_data` volume. Back up any data before removing that volume to reinitialize it.
