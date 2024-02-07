const fs = require('fs')
const express = require('express')
const router = express.Router()
const db = require('../lib/db')
const exec = require('child_process').exec

// find season
let getSeason = async function (req, res, next) {
	try {
		let mode = (req.params.mode) ? req.params.mode.split('-')[0] : req.params.mode
		if(['ctf','nf','eltp','ecltp'].includes(mode) && req.params.season) {
			let filters = [mode, parseInt(req.params.season)]

			let tier = (req.params.mode) ? req.params.mode.split('-')[1] : false
			if(['majors','minors', 'novice'].includes(tier))
				filters.push(tier)

			let seasonid = await db.select(`
				SELECT id
				FROM season
				WHERE mode = $1 AND number = $2 ${tier ? 'AND LOWER(tier) = $3' : ''}
				LIMIT 1
			`, filters, 'id')

			if(!seasonid)
				throw 'invalid season'

			req.season = req.params.season
			req.seasonid = seasonid
			req.mode = mode
			req.seasonTier = (tier) ? tier.toLowerCase().replace(/\b[a-z]/g, letter => letter.toUpperCase()) : ''
			req.seasonname = req.mode + ' ' + req.season + (tier ? ' ' + req.seasonTier : '')
		}
		if(req.params.player) {
			req.player = {
				id: await db.select(`SELECT id from player WHERE name = $1`, [req.params.player], 'id'),
				name: req.params.player
			}
			if(!req.player.id)
				throw 'cannot find player: ' + req.params.player
		}

	} catch(err) {
		next(err)
	}

	next()
}
router.use(getSeason)

router.get('/', (req, res) => require('../models/home').init(req, res))

router.use('/rank/leaderboard', (req, res) => require('../models/pub/all-leaderboard').init(req, res))

router.use('/api',  require('./api'))

router.get('/spy', (req, res) => require('../models/spy').list(req, res))
router.get('/spy/generate', (req, res) => require('../models/spy').generate(req, res))

router.get('/player', (req, res) => require('../models/players').init(req, res))
router.use('/player/:player', getSeason, require('./player'))

router.get('/search', (req, res) => require('../models/search').init(req, res))

router.get('/records/:mode/:tier', (req, res) => require('../models/records').init(req, res, 'records'))

router.get('/rules', (req, res) => require('../models/markdown').init(req, res, 'rules'))
router.get('/faq', (req, res) => require('../models/markdown').init(req, res, 'faq'))
router.get('/rankedpubs', (req, res) => require('../models/markdown').init(req, res, 'rankedpubs'))

router.use('/:mode/:season', getSeason, require('./season'))


router.use((req, res) => res.status(404).render('404'))

module.exports = router
