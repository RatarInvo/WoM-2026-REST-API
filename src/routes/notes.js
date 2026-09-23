const express = require('express')
const router = express.Router()
const { PrismaClient } = require('@prisma/client')  // object destructuring
const authorize = require('../middleware/authorize')

const prisma = new PrismaClient()

router.use(authorize)

const accessibleBoard = (userId) => ({
    OR: [
        { owner_id: userId },
        { user_ids: { has: userId } }
    ]
})

const boardIdFromRequest = (value) => {
    const boardId = Number(value)
    return Number.isInteger(boardId) && boardId > 0 ? boardId : null
}

router.get('/', async (req, res) => {
    try {
        const notes = await prisma.notes.findMany({
            where: {
                board: accessibleBoard(req.authUser.sub)
            },
            include: {
                board: {
                    select: { id: true, name: true }
                }
            },
            orderBy: { id: 'asc' }
        })

        return res.json(notes)
    } catch (error) {
        return res.status(500).json({
            msg: 'Could not fetch notes',
            error: error.message
        })
    }
})

router.get('/:id', async (req, res) => {
    const noteId = Number(req.params.id)

    if (!Number.isInteger(noteId)) {
        return res.status(400).json({ msg: 'Invalid note id' })
    }

    try {
        const note = await prisma.notes.findFirst({
            where: {
                id: noteId,
                board: accessibleBoard(req.authUser.sub)
            },
            include: {
                board: {
                    select: { id: true, name: true }
                }
            }
        })

        if (!note) {
            return res.status(404).json({ msg: 'Note not found' })
        }

        return res.json(note)
    } catch (error) {
        return res.status(500).json({
            msg: 'Could not fetch note',
            error: error.message
        })
    }
})

router.post('/', async (req, res) => {
    if (!req.authUser || !req.authUser.sub) {
        return res.status(401).json({ msg: 'Unauthorized' })
    }

    const noteText = req.body?.note
    const boardId = boardIdFromRequest(req.body?.board_id)

    if (!noteText || !noteText.trim()) {
        return res.status(400).json({ msg: 'Note text is required' })
    }

    if (!boardId) {
        return res.status(400).json({ msg: 'board_id is required' })
    }

    try {
        const board = await prisma.boards.findFirst({
            where: {
                id: boardId,
                ...accessibleBoard(req.authUser.sub)
            }
        })

        if (!board) {
            return res.status(403).json({ msg: 'No access to board' })
        }

        const note = await prisma.notes.create({
            data: {
                author_id: req.authUser.sub,
                board_id: boardId,
                note: noteText.trim()
            }
        })

        return res.status(201).json({
            user: req.authUser.name,
            msg: 'Note created',
            id: note.id
        })
    } catch (error) {
        return res.status(500).json({
            msg: 'Could not create note',
            error: error.message
        })
    }
})

router.put('/:id', async (req, res) => {
    const noteId = Number(req.params.id)

    if (!Number.isInteger(noteId)) {
        return res.status(400).json({ msg: 'Invalid note id' })
    }

    const newNote = req.body?.note

    if (!newNote || !newNote.trim()) {
        return res.status(400).json({ msg: 'Note text is required' })
    }

    try {
        const existingNote = await prisma.notes.findFirst({
            where: {
                id: noteId,
                board: accessibleBoard(req.authUser.sub)
            }
        })

        if (!existingNote) {
            return res.status(404).json({ msg: 'Note not found' })
        }

        const note = await prisma.notes.update({
            where: { id: noteId },
            data: { note: newNote.trim() }
        })

        return res.json({
            msg: 'Note updated',
            id: note.id,
            updatedNote: note
        })
    } catch (error) {
        return res.status(500).json({
            msg: 'Could not update note',
            error: error.message
        })
    }
})

router.delete('/:id', async (req, res) => {
    const noteId = Number(req.params.id)

    if (!Number.isInteger(noteId)) {
        return res.status(400).json({ msg: 'Invalid note id' })
    }

    try {
        const existingNote = await prisma.notes.findFirst({
            where: {
                id: noteId,
                board: accessibleBoard(req.authUser.sub)
            }
        })

        if (!existingNote) {
            return res.status(404).json({ msg: 'Note not found' })
        }

        const note = await prisma.notes.delete({
            where: { id: noteId }
        })

        return res.json({
            msg: 'Note deleted',
            id: note.id
        })
    } catch (error) {
        return res.status(500).json({
            msg: 'Could not delete note',
            error: error.message
        })
    }
})


module.exports = router