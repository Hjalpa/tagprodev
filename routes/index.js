process.env.NODE_TLS_REJECT_UNAUTHORIZED='0'

const fs = require('fs')
const express = require('express')
const router = express.Router()
// const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
const db = require('../lib/db')
// const account = require('../lib/user')
const exec = require('child_process').exec

// router.get('/.well-known/acme-challenge/rNyakLXFOhNqszyN3dQIc8ylfC0GkOJzXxHpMmTfyI4', async (req, res) => res.send('rNyakLXFOhNqszyN3dQIc8ylfC0GkOJzXxHpMmTfyI4.qHHteSBfKXYnAnQTAXoiP82unkcnaaMWYrV7cwF4zAk'))

router.get('/', async (req, res) => res.send('<a href="https://www.youtube.com/playlist?list=PLseDkLomexJdJGi56ZpXYE1P3jxpAlA4m">adventure</a>'))
router.use('/api',  require('./api'))
router.use('/stats',  require('./stats'))

module.exports = router
