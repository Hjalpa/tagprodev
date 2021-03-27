process.env.NODE_TLS_REJECT_UNAUTHORIZED='0'

const fs = require('fs')
const express = require('express')
const router = express.Router()
const db = require('../lib/db')
const exec = require('child_process').exec

// router.get('/.well-known/acme-challenge/rNyakLXFOhNqszyN3dQIc8ylfC0GkOJzXxHpMmTfyI4', async (req, res) => res.send('rNyakLXFOhNqszyN3dQIc8ylfC0GkOJzXxHpMmTfyI4.qHHteSBfKXYnAnQTAXoiP82unkcnaaMWYrV7cwF4zAk'))

const stats = require('../models/stats')
router.get('/', (req, res) => stats.home(req, res))

const results = require('../models/stats-results')
router.get('/results', (req, res) => results.results(req, res))

router.use('/api',  require('./api'))
router.use('/stats',  require('./stats'))






module.exports = router
