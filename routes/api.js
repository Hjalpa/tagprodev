const express = require('express')
const router = express.Router()
const routeCache = require('route-cache')

const imp = require('../models/import')
router.post('/import', (req, res) => imp.game(req, res))

// used for raw stats
const raw = require('../models/_raw')
router.get('/raw', (req, res) => raw.game(req, res))

// spies
const spy = require('../models/spy')
router.post('/spy', (req, res) => spy.update(req, res))
router.post('/spy_novice', (req, res) => spy.updateNovice(req, res))

module.exports = router
