var express = require('express');
var router = express.Router();
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const { JWT_TOKEN } = process.env
const withAuth = require('../middlewares/auth')

require('dotenv').config()

router.post('/register', async (req,res) => {
  const {name, email, password} = req.body
  const user = new User({ name, email, password })
  
  try {
    await user.save()
    res.status(200).json(user)
  } catch (error) {
    res.status(500).json({ error: 'Error registering new user' })
  }
})

router.post('/login', async (req,res)=> {
  const { email, password } = req.body
  
  try {
    let user = await User.findOne({ email })
    
    if (!user)
      res.status(401).json({ error: 'Incorrect email or password' })
    
    else 
      user.isCorrectPassword(password, (err, same) => {
        if (!same) {
          res.status(401).json({ error: 'Incorrect email or password'})
        }
        
        else {
          const token = jwt.sign({ email }, JWT_TOKEN, { expiresIn: '1d' })
          res.json({ user: user, token: token })
        }   
      })
  } catch (error) {
    res.status(500).json({ error: 'Internal error please try again' })
  }
})

router.put('/', withAuth, async (req,res) => {
  const { name, email } = req.body

  try {
    const user = await User.findOneAndUpdate(
      { _id: req.user._id },
      { $set: { name: name, email: email } },
      { upsert: true, 'new': true }
    )

    res.json(user)
  } catch (error) {
    res.status(401).json({ error: error })
  }
})

router.put('/password', withAuth, async (req,res) => {
  const { password } = req.body

  try {
    const user = await User.findOneAndUpdate({ _id: req.user._id })
    user.password = password
    await user.save()

    res.json(user)
  } catch (error) {
    res.status(401).json({ error: error })
  }
})

router.put('/:id', withAuth, async(req,res) => {
  const { id } = req.params
  const { name, password } = req.body

  try {
    let user = await User.findById(id)
    
    if (user){
      user.name = name
      user.password = password
      user.updated_at = Date.now()
      await user.save()

      res.json(user)
    } else
        res.status(404).json({ error: 'User not found' })

  } catch (error) {
    res.status(500).json({ error: 'Problem to update user' })
    console.log(error)
  }
})

router.delete('/', withAuth, async (req,res) => {
  try {
    const user = await User.findOne({ _id: req.body._id })
    await user.delete()

    res.json({ message: 'OK' }).status(201)
  } catch (error) {
    res.status(500).json({ error: error })
  }
})

router.delete('/:id', withAuth, async(req,res) => {
  const { id } = req.params

  try {
    await User.findByIdAndDelete(id)
    
    res.json({ message: 'User deleted successfully' })
  } catch (error) {
      res.status(500).json({ error: 'Problem to delete user' })
  }
})

module.exports = router;
