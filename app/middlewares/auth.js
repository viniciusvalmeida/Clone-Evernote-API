require('dotenv').config()
const { JWT_TOKEN } = process.env
const jwt = require('jsonwebtoken')
const User = require('../models/user')

const withAuth = (req, res, next) => {
    const token = req.headers['x-access-token']
    if (!token)
        res.status(401).json({ error: 'Unauthorized: no token provider' })
    else 
        jwt.verify(token, JWT_TOKEN, (err, decode) => {
            if (err)
            res.status(401).json({ error: 'Unauthorized: token invalid' })
            else {
                User.findOne({ email: decode.email })
                    .then(user => {
                        req.user = user
                        next()
                    })
                    .catch(err => {
                        res.status(401).json({ error: err })
                    })
            }

        })
}

module.exports = withAuth