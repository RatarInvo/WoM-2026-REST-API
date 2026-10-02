const express = require('express')
const router = express.Router()
const { PrismaClient } = require('@prisma/client')
const authorize = require('../middleware/authorize')

const prisma = new PrismaClient()

router.use(authorize)

const accessibleBoard = (userId) => ({
    OR: [
        { owner_id: userId },
        { user_ids: { has: userId } }
    ]
})

router.get('/', async (req, res) => {
    try {
        const boards = await prisma.boards.findMany({
            where: accessibleBoard(req.authUser.sub),
            select: { id: true, name: true, owner_id: true },
            orderBy: { id: 'asc' }
        })

        return res.json(boards)
    } catch (error) {
        return res.status(500).json({
            msg: 'Could not fetch boards',
            error: error.message
        })
    }
})

router.post('/', async (req, res) => {
    const name = req.body?.name?.trim()

    if (!name) {
        return res.status(400).json({ msg: 'Board name is required' })
    }

    if (name.length > 100) {
        return res.status(400).json({ msg: 'Board name can be max 100 characters' })
    }

    try {
        const board = await prisma.boards.create({
            data: {
                name: name,
                owner_id: req.authUser.sub,
                user_ids: []
            },
            select: { id: true, name: true, owner_id: true }
        })

        return res.status(201).json(board)
    } catch (error) {
        return res.status(500).json({
            msg: 'Could not create board',
            error: error.message
        })
    }
})

module.exports = router