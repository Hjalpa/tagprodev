// process.env.NODE_TLS_REJECT_UNAUTHORIZED='0'
const fs = require('fs')
const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
// const db = require('../lib/db')
// const account = require('../lib/user')

router.get('/', async (req, res) => res.render('home'))

// router.get('/.well-known/acme-challenge/3wuiXR20qazFnh8dCc2JZbHMZwKOBJaE1xhYzpd7M5k', (req, res) => res.send('3wuiXR20qazFnh8dCc2JZbHMZwKOBJaE1xhYzpd7M5k.qluB0M4L7JSCY8x8sMEc9QjddgQ1GTRreDxL6g1_mdY'))


module.exports = router
