var express = require('express');
const withAuth = require('../middlewares/auth');
var router = express.Router();
const Note = require('../models/note')

const isOwner = (user, note) => {
    if (JSON.stringify(user._id) === JSON.stringify(note.author._id))
        return true
    else
        return false
}

router.post('/', withAuth, async (req, res) => {
    const { title, body } = req.body
    try {
        const note = new Note({ title: title, body: body, author: req.user._id })
        await note.save()
        res.json(note)
    } catch (err) {
        res.status(500).json({ error: 'Problem to create a new note' })
    }
})

router.get('/:id', withAuth, async (req,res) => {
    try {
        const { id } = req.params
        const note = await Note.findById(id)
        
        if (isOwner(req.user, note))
            res.json(note)
        else
            res.status(403).json({ error: 'Permission denied' })
    } catch (error) {
        res.status(500).json({ error: 'Problem to get a note' })
    }
})

module.exports = router