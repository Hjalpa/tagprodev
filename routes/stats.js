const db = require ('../lib/db')
const express = require('express')
const router = express.Router()

 // get maps
 let maps = async function (req, res, next) {
	req.maps = await db.select(`SELECT id, name FROM map ORDER BY name ASC`, [], 'all')
	next()
 }
 router.use(maps)


// general
router.get('/wins', (req, res) => require('../models/stats/wins').init(req, res))
router.get('/summary-per-minute', (req, res) => require('../models/stats/summary-per-minute').init(req, res))
router.get('/summary-total', (req, res) => require('../models/stats/summary-total').init(req, res))
router.get('/pups', (req, res) => require('../models/stats/pups').init(req, res))
router.get('/mercies', (req, res) => require('../models/stats/mercies').init(req, res))


// attacking
router.get('/caps', (req, res) => require('../models/stats/caps').init(req, res))
router.get('/hold', (req, res) => require('../models/stats/hold').init(req, res))

router.get('/flaccids', (req, res) => require('../models/stats/flaccids').init(req, res))


// defence
router.get('/prevent', (req, res) => require('../models/stats/prevent').init(req, res))
router.get('/returns', (req, res) => require('../models/stats/returns').init(req, res))
router.get('/tags', (req, res) => require('../models/stats/tags').init(req, res))
router.get('/quick-returns', (req, res) => require('../models/stats/quick-returns').init(req, res))
router.get('/key-returns', (req, res) => require('../models/stats/key-returns').init(req, res))

router.get('/team-cap-from-my-prevent', (req, res) => require('../models/stats/team-cap-from-my-prevent').init(req, res))





router.get('/grab-whilst-opponents-hold', (req, res) => require('../models/stats-grabwhilstopponentshold').init(req, res))

router.get('/return-within-5-tiles-from-opponents-base', (req, res) => require('../models/stats-returnwithin5tilesfromopponentsbase').init(req, res))
router.get('/return-within-2-tiles-from-opponents-base', (req, res) => require('../models/stats-returnwithin2tilesfromopponentsbase').init(req, res))

router.get('/drop-within-5-tiles-from-my-base', (req, res) => require('../models/stats-dropwithin5tilesfrommybase').init(req, res))
router.get('/drop-within-2-tiles-from-my-base', (req, res) => require('../models/stats-dropwithin2tilesfrommybase').init(req, res))



module.exports = router
