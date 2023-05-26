# Whiteboard application

This a simple whiteboard application. Its lets you collect ideas together. Add notes, sketches and texts.

## Installation instructions

Run npm install in both client & server.

Create a postgres db using the following command.

```shell
docker run --name postgres-db -e POSTGRES_PASSWORD=docker -p 5432:5432 -d postgres
```

Then create a db using psql.

```shell
> psql postgres://postgres:db-password@localhost:5432
> CREATE DATABASE WHITEBOARD_DB;
```

Create a .env file in the server directory with the following connection string:

```shell
DATABASE_URL="postgres://postgres:db-password@localhost:5432/whiteboard_db"
```
