const express = require('express')
const router = express.Router()

router.get('/wins', (req, res) => require('../models/stats-wins').init(req, res))
router.get('/returns', (req, res) => require('../models/stats-returns').init(req, res))
router.get('/tags', (req, res) => require('../models/stats-tags').init(req, res))
router.get('/caps', (req, res) => require('../models/stats-caps').init(req, res))
router.get('/pups', (req, res) => require('../models/stats-pups').init(req, res))
router.get('/prevent', (req, res) => require('../models/stats-prevent').init(req, res))
router.get('/flaccids', (req, res) => require('../models/stats-flaccids').init(req, res))
router.get('/hold', (req, res) => require('../models/stats-hold').init(req, res))

router.get('/team-cap-from-my-prevent', (req, res) => require('../models/stats-teamcapfrommyprevent').init(req, res))
router.get('/grab-whilst-opponents-hold', (req, res) => require('../models/stats-grabwhilstopponentshold').init(req, res))

module.exports = router
