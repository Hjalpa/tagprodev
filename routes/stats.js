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

router.get('/return-within-5-tiles-from-opponents-base', (req, res) => require('../models/stats-returnwithin5tilesfromopponentsbase').init(req, res))
router.get('/return-within-2-tiles-from-opponents-base', (req, res) => require('../models/stats-returnwithin2tilesfromopponentsbase').init(req, res))

router.get('/drop-within-5-tiles-from-my-base', (req, res) => require('../models/stats-dropwithin5tilesfrommybase').init(req, res))
router.get('/drop-within-2-tiles-from-my-base', (req, res) => require('../models/stats-dropwithin2tilesfrommybase').init(req, res))

router.get('/quick-returns', (req, res) => require('../models/stats-quickreturns').init(req, res))
router.get('/key-returns', (req, res) => require('../models/stats-keyreturns').init(req, res))

module.exports = router
