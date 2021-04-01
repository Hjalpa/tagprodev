process.env.NODE_TLS_REJECT_UNAUTHORIZED='0'

const fs = require('fs')
const express = require('express')
const router = express.Router()
const db = require('../lib/db')
const exec = require('child_process').exec

// router.get('/.well-known/acme-challenge/rNyakLXFOhNqszyN3dQIc8ylfC0GkOJzXxHpMmTfyI4', async (req, res) => res.send('rNyakLXFOhNqszyN3dQIc8ylfC0GkOJzXxHpMmTfyI4.qHHteSBfKXYnAnQTAXoiP82unkcnaaMWYrV7cwF4zAk'))

router.get('/', (req, res) => require('../models/leaderboards').init(req, res))
router.get('/log', (req, res) => require('../models/log').init(req, res))

router.use('/api',  require('./api'))
router.use('/stats',  require('./stats'))
router.use('/records',  require('./records'))

module.exports = router
