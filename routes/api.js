const express = require('express')
const router = express.Router()

const imp = require('../models/import')
router.post('/import', (req, res) => imp.game(req, res))

// used for raw stats
const raw = require('../models/_raw')
router.get('/raw', (req, res) => raw.game(req, res))

// spies
const spy = require('../models/spy')
router.post('/spy', (req, res) => spy.player(req, res))
router.post('/spy/update', (req, res) => spy.update(req, res))

// pub data
router.post('/pub/import', (req, res) => require('../models/pub/import').import(req, res))
router.get('/pub/leaderboard', (req, res) => require('../models/pub/leaderboard').init(req, res))

module.exports = router
