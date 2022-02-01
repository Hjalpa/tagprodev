const express = require('express')
const router = express.Router()

const imp = require('../models/import')
router.post('/import', (req, res) => imp.game(req, res))

const sl_imp = require('../models/superleague/import')
router.post('/superleague/import', (req, res) => sl_imp.game(req, res))

// used for raw stats
const raw = require('../models/_raw')
router.get('/raw', (req, res) => raw.game(req, res))


// sign ups

module.exports = router
