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
app.use('/notes', notesRouter)

app.listen(PORT, () => {
    console.log(`Running on http://localhost:${PORT}`)
})