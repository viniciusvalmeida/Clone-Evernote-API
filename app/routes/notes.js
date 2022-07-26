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

router.get('/', withAuth, async (req,res) => {
    try {
        const note = await Note.find({ author: req.user._id })
        res.json(note)
    } catch (error) {
        res.status(500).json({ error: error })
    }
})

router.get('/search', withAuth, async(req, res) => {
    const { query } = req.query

    try {
        const note = await Note
            .find({ author: req.user._id })
            .find({ $text: { $search: query } })
        
        res.json(note)
    } catch (error) {
        res.status(500).json({ error: error })
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

router.put('/:id', withAuth, async (req, res) => {
    const { title, body } = req.body
    const { id } = req.params

    try {
        const note = await Note.findById(id)
        
        if (isOwner(req.user, note)){
            const note = await Note.findByIdAndUpdate( id, 
                { $set: { title: title, body: body, updated_at: Date.now() } },
                { upsert: true, 'new': true }
            )
            
            res.json(note)
        } else
            res.status(403).json({ error: 'Permission denied' })

    } catch (error) {
        res.status(500).json({ error: 'Problem to update a note' })
    }
})

router.delete('/:id', withAuth, async(req,res) => {
    const { id } = req.params

    try {
        const note = await Note.findById(id)

        if (note && isOwner(req.user, note)){
            await note.delete()
            res.status(200).json({ message: 'Note deleted' })
        } else
            res.status(403).json({ error: 'Permission denied' })
    } catch (error) {
        res.status(500).json('Problem to delete a note')
    }
})

module.exports = router