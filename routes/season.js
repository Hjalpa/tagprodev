const express = require('express')
const router = express.Router()
const db = require('../lib/db')

router.get('/', async (req, res) => {
	let date = await db.select('SELECT date FROM seasonschedule WHERE seasonid = $1 AND gameid IS NOT NULL ORDER BY date ASC LIMIT 1', [req.seasonid], 'date')
	if(date)
		require('../models/season/overview').init(req, res)
	else
		require('../models/signup').init(req, res)
})

router.post('/signup', (req, res) => require('../models/signup').signup(req, res))
router.get('/draftpacket', (req, res) => require('../models/signup').draftpacket(req, res))

router.get('/matches/:id?', (req, res) => require('../models/season/matches').init(req, res))
router.get('/leaders/:id?', (req, res) => require('../models/season/leaders').init(req, res))
router.get('/records', (req, res) => require('../models/season/records').init(req, res))
router.get('/league', (req, res) => require('../models/season/league').init(req, res))
router.get('/playoffs', (req, res) => require('../models/season/playoffs').init(req, res))
router.get('/teams', (req, res) => require('../models/season/teams').init(req, res))

router.get('/stats/:id?(\.csv|\.json)', (req, res) => require('../models/season/stats').export(req, res))
router.get('/stats/:id?', (req, res) => require('../models/season/stats').init(req, res))

module.exports = router
