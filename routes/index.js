const fs = require('fs')
const express = require('express')
const cache = require('memory-cache')
const router = express.Router()
const db = require('../lib/db')
const exec = require('child_process').exec

// STOP APACHE IF THE PORT ERROR 80 exists AND RESTART AFTER CERT DONE
// router.get('/.well-known/acme-challenge/kMuQwP5pMf89ccthmb7_UVsA9oZLy9R3i-amWDeQRrA', async (req, res) => res.send('kMuQwP5pMf89ccthmb7_UVsA9oZLy9R3i-amWDeQRrA.hYRGI90GO3NsQmmnTO1Uwp7jwf_HnYCV7HPC3UrthtQ'))

// find season
let getSeason = async function (req, res, next) {
	let season = false
	try {
		if(['ctf','nf','egg','eltp','ecltp'].includes(req.params.mode) && req.params.season) {
			let season = await db.select(`
				SELECT id
				FROM season
				WHERE mode = $1 AND number = $2
				LIMIT 1
			`, [req.params.mode, req.params.season], 'id')

			if(!season)
				throw 'invalid season'

			req.season = req.params.season
			req.seasonid = season
			req.mode = req.params.mode
			req.seasonname = req.mode + ' Season ' + req.season
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

router.use((req, res, next) => req.secure ? next() : res.redirect('https://' + req.headers.host + req.url))



// router.get('/', (req, res) => require('../models/home').init(req, res))
router.get('/', (req, res) => res.redirect('../player'))

// pause this
router.get('/egg/1', (req, res) => res.redirect('../ctf/2'))

router.use('/api',  require('./api'))
// router.use('/leaderboards',  require('./leaderboards'))

router.get('/player', (req, res) => require('../models/players').init(req, res))
router.use('/player/:player', getSeason, require('./player'))
router.use('/:mode/:season', getSeason, require('./season'))

router.get('/rules', (req, res) => require('../models/markdown').init(req, res, 'rules'))
router.get('/faq', (req, res) => require('../models/markdown').init(req, res, 'faq'))

// who has played?
router.get('/r300', (req, res) => require('../models/r300').init(req, res))

router.get('/spy', (req, res) => require('../models/spy').list(req, res))

router.use((req, res) => res.status(404).render('404'))

module.exports = router
