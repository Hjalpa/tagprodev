const express = require('express')
const router = express.Router()

router.get('/', (req, res) => require('../models/player/overview').init(req, res))
router.get('/matches/:gamemode?', (req, res) => require('../models/player/matches').init(req, res))
router.get('/allies', (req, res) => require('../models/player/allies').init(req, res))
router.get('/opponents', (req, res) => require('../models/player/opponents').init(req, res))
router.get('/seasons', (req, res) => require('../models/player/seasons').init(req, res))
router.get('/maps', (req, res) => require('../models/player/maps').init(req, res))

module.exports = router
