const express = require('express')
const router = express.Router()

const imp = require('../models/import')
router.post('/import', (req, res) => imp.game(req, res))

// used for raw stats
const raw = require('../models/_raw')
router.get('/raw', (req, res) => raw.game(req, res))

module.exports = router
