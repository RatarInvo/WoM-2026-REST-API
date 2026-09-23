# rahti2 node.js

### For deployment to Rahti2

Note: OpenShift wants the main branch to be named *master* by default, you have two options:
1. Push to origin/master to deploy
2. Change the setting in Openshift to *main*:    
    Edit BuildConfig ==> Show advanced git options ==> Git reference: `main`

### For local real-time development

Rename `.env-example` to `.env` to override the `MODE=production`set in the `Dockerfile`. Note that this needs a valueless declaration of `MODE` in `docker-compose.yml`

To run the container locally:
`docker-compose up --build`

### Boards

Notes belong to a board. Apply the Prisma schema to the database with:

`npx prisma db push`

Create boards directly in PostgreSQL. `owner_id` always has access, and users in
`user_ids` can read, update and delete notes on the board:

```sql
INSERT INTO boards (name, owner_id, user_ids)
VALUES (
    'Project A',
    'owner-user-uuid',
    ARRAY['owner-user-uuid', 'another-user-uuid']::uuid[]
);
```

When creating a note, send the board id:

```json
{
    "note": "A note in Project A",
    "board_id": 1
}
```

The notes endpoints return `board.id` and `board.name`, so the frontend can
group or filter notes by board.
