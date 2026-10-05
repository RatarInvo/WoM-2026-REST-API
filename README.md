# Notes App API

REST and WebSocket API for shared boards, notes, and realtime collaboration.

The deployed API is available at:

```text
https://wom-2026-rest-api.onrender.com/
```

Interactive API documentation is served from the root URL.

## Features

- Create and list collaborative boards
- Create, read, update, and delete notes
- Store note position, size, and color
- JWT authentication for REST and WebSocket connections
- Realtime note movement, typing, creation, update, and deletion events
- PostgreSQL persistence through Prisma
- Docker support for local development and deployment

## Requirements

- Node.js 24 or later
- PostgreSQL database
- npm

## Configuration

Create a `.env` file in the project root. Do not commit real credentials or tokens.

```env
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"
JWT_SECRET="replace-with-the-same-secret-used-by-the-authentication-service"
PORT=4000
MODE=development
```

`JWT_SECRET` must match the secret used to issue the JWTs. The authenticated user's ID is read from the token's `sub` claim.

## Installation

```bash
npm install
npx prisma generate
```

Apply the Prisma schema to a development database when needed:

```bash
npx prisma db push
```

## Running locally

Start the production-style server:

```bash
npm start
```

Start the development server with Nodemon:

```bash
npm run dev
```

The API is then available at `http://localhost:4000/`.

## Authentication

All `/boards` and `/notes` REST endpoints require a Bearer token:

```http
Authorization: Bearer <your-jwt>
```

Example request:

```bash
curl http://localhost:4000/boards \
  -H "Authorization: Bearer <your-jwt>"
```

The API only returns boards owned by the authenticated user or boards where the user is included in the board's shared user list.

## REST endpoints

### Boards

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/boards` | List accessible boards |
| `POST` | `/boards` | Create a board |

Create a board:

```bash
curl -X POST http://localhost:4000/boards \
  -H "Authorization: Bearer <your-jwt>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Project ideas"}'
```

Board names are required and may contain up to 100 characters.

### Notes

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/notes` | List notes on accessible boards |
| `GET` | `/notes/:id` | Get one note |
| `POST` | `/notes` | Create a note |
| `PUT` | `/notes/:id` | Update note text or layout |
| `DELETE` | `/notes/:id` | Delete a note |

Create a note:

```bash
curl -X POST http://localhost:4000/notes \
  -H "Authorization: Bearer <your-jwt>" \
  -H "Content-Type: application/json" \
  -d '{"note":"Remember the launch date","board_id":2}'
```

Update note text or layout:

```bash
curl -X PUT http://localhost:4000/notes/12 \
  -H "Authorization: Bearer <your-jwt>" \
  -H "Content-Type: application/json" \
  -d '{"note":"Updated text","x":180,"y":90,"width":220,"height":160,"color":3}'
```

Layout values are validated as follows:

| Field | Allowed range |
| --- | --- |
| `x`, `y` | `0`–`100000` |
| `width`, `height` | `50`–`5000` |
| `color` | `0`–`20` |

## WebSocket API

Connect to the deployed WebSocket endpoint with the JWT in the query string:

```text
wss://wom-2026-rest-api.onrender.com/?token=<your-jwt>
```

For local development:

```text
ws://localhost:4000/?token=<your-jwt>
```

After connecting, join a board:

```json
{
  "type": "join",
  "board_id": 2
}
```

### Client messages

Move a note:

```json
{
  "type": "note_moving",
  "id": 12,
  "x": 180,
  "y": 90,
  "width": 220,
  "height": 160
}
```

Send a typing preview:

```json
{
  "type": "note_typing",
  "id": 12,
  "content": "Draft text..."
}
```

Typing content is limited to 5000 characters. Movement values are rounded to integers.

### Server events

REST changes are broadcast to other clients in the board room:

- `note_created` includes `board_id` and `note`
- `note_updated` includes `board_id` and `note`
- `note_deleted` includes `board_id` and `id`
- `note_moving` includes the note layout fields
- `note_typing` includes the note ID and temporary content

Invalid or missing WebSocket tokens close the connection with code `4001`.

## Error responses

Errors are returned as JSON with a `msg` field and, for server errors, an `error` field.

| Status | Meaning |
| --- | --- |
| `400` | Invalid ID, missing required data, or invalid layout value |
| `401` | Missing or invalid authentication |
| `403` | The user cannot access the requested board |
| `404` | The requested note was not found |
| `500` | Unexpected server or database error |

Example:

```json
{
  "msg": "Note not found"
}
```

## Docker

Build and start the API with Docker Compose:

```bash
docker compose up --build
```

The service listens on port `4000`. Provide `DATABASE_URL`, `JWT_SECRET`, and `MODE` through the environment used by Docker Compose.

## Project structure

```text
src/
├── middleware/authorize.js   JWT verification
├── routes/boards.js          Board REST routes
├── routes/notes.js           Note REST routes
├── realtime.js               WebSocket rooms and events
├── server.js                 Express server entry point
└── static/index.html         API documentation page
prisma/schema.prisma          Database schema
```
