const db = require ('../lib/db')
const express = require('express')
const router = express.Router()

// get maps
let maps = async function (req, res, next) {
	req.maps = await db.select(`SELECT id, name FROM map ORDER BY name ASC`, [], 'all')
	next()
}
router.use(maps)

router.get('/:userId', (req, res) => require('../models/players/dash').init(req, res))
router.get('/:userId/allies', (req, res) => require('../models/players/allies').init(req, res))
router.get('/:userId/opponents', (req, res) => require('../models/players/opponents').init(req, res))
router.get('/:userId/maps', (req, res) => require('../models/players/maps').init(req, res))
router.get('/:userId/breakdown', (req, res) => require('../models/players/breakdown').init(req, res))

module.exports = router
