const express = require('express')
const cors = require('cors')

const app = express()
require('dotenv').config()

const PORT = process.env.PORT || 4000

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
    res.json({ msg: "Notes API", version: "0.1" })
})

const notesRouter = require('./routes/notes')
const boardsRouter = require('./routes/boards')

app.use('/notes', notesRouter)
app.use('/boards', boardsRouter)

const { setupRealtime } = require('./realtime')

setupRealtime(server)