const express = require('express')
const router = express.Router()
const { PrismaClient } = require('@prisma/client')  // object destructuring
const authorize = require('../middleware/authorize')

const prisma = new PrismaClient()

router.use(authorize)

router.get('/', async (req, res) => {
    const notes = await prisma.notes.findMany({
        where: { username: (req.authUser.username) },
        orderBy: { id: 'asc' }
    })
    res.send(notes)
})

router.get('/:id', async (req, res) => {
    const note = await prisma.notes.findUnique({
        where: { 
            id: (req.params.id),
            username: (req.authUser.username)
        }
    })
    if (!note) res.status(404).send({msg: "Note not found"})

    res.send(note)
})


router.post('/', async (req, res) => {
    console.log(req.body)
    
    const note = await prisma.notes.create({
        data: { 
            username: (req.authUser.username),
            note: req.body.note 
        }
    })
    
    res.send({
        msg: "Note created", 
        id: note.id
    })
})

router.put('/:id', async (req, res) => {
    console.log(`PATCH ${req.params.id}`)

    const note = await prisma.notes.update({
        data: { note: req.body.note, updated_at: new Date() },
        where: { id: (req.params.id) }
    })

    res.send({
        msg: "Note updated", 
        id: note.id,
        updatedNote: note
    })
})

router.delete('/:id', async (req, res) => {

    const note = await prisma.notes.delete({
        where: { id: (req.params.id) }
    })

    res.send({
        msg: "Note deleted", 
        id: note.id
    })
})


module.exports = router