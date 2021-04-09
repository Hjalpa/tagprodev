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
router.get('/league-table', (req, res) => require('../models/stats/league-table').init(req, res))

router.get('/summary', (req, res) => require('../models/stats/summary').init(req, res))
router.get('/summary/total', (req, res) => require('../models/stats/summary-total').init(req, res))

router.get('/attacking', (req, res) => require('../models/stats/attacking').init(req, res))
router.get('/attacking/od', (req, res) => require('../models/stats/attacking-od').init(req, res))

router.get('/defending', (req, res) => require('../models/stats/defending').init(req, res))
router.get('/defending/returns', (req, res) => require('../models/stats/defending-returns').init(req, res))

router.get('/pups', (req, res) => require('../models/stats/pups').init(req, res))
router.get('/miscellaneous', (req, res) => require('../models/stats/miscellaneous').init(req, res))

// attacking
router.get('/caps', (req, res) => require('../models/stats/caps').init(req, res))
router.get('/hold', (req, res) => require('../models/stats/hold').init(req, res))

// defence
router.get('/prevent', (req, res) => require('../models/stats/prevent').init(req, res))
router.get('/returns', (req, res) => require('../models/stats/returns').init(req, res))

module.exports = router
