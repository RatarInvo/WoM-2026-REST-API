const express = require('express')
const router = express.Router()

// Temporär "databas", ersätts senare med riktig DB
const tempData = [
    { "text": "Hello" },
    { "text": "morjens" }
]

router.get('/', (req, res) => {
    res.send(tempData)
})

router.post('/', (req, res) => {
    console.log(req.body)
    // TEMP, ersätts med DB
    tempData.push(req.body)
    res.send({
        msg: "Note created", 
        id: tempData.length
    })
})

router.put('/:id', (req, res) => {
    console.log(`PATCH ${req.params.id}`)
    // TEMP, ersätts med DB
    tempData[req.params.id-1] = req.body
    res.send({
        msg: "Note updated", 
        id: req.params.id,
        newNote: tempData[req.params.id-1]
    })
})

router.delete('/:id', (req, res) => {
    // TEMP, ersätts med DB
    tempData.splice(req.params.id-1)

    res.send({
        msg: "Note deleted", 
        id: req.params.id
    })
})

module.exports = router