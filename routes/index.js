const fs = require('fs')
const express = require('express')
const cache = require('memory-cache')
const router = express.Router()
const db = require('../lib/db')
const exec = require('child_process').exec

// STOP APACHE IF THE PORT ERROR 80 exists AND RESTART AFTER CERT DONE
// router.get('/.well-known/acme-challenge/xEnQIF270N03wZzphl0IPqUkPkMaZOWxo_ZGlh0iipM', async (req, res) => res.send('xEnQIF270N03wZzphl0IPqUkPkMaZOWxo_ZGlh0iipM.hYRGI90GO3NsQmmnTO1Uwp7jwf_HnYCV7HPC3UrthtQ'))

// find season
let getSeason = async function (req, res, next) {
	let season = false
	try {

		if(req.params.season && req.params.mode) {
			season = await db.select(`
				SELECT id
				FROM season
				WHERE mode = $1 AND number = $2
				LIMIT 1
			`, [req.params.mode, req.params.season], 'id')

			if(!season)
				throw 'invalid season'
		}

	} catch(err) {
		next(err)
	}

	req.season = req.params.season
	req.seasonname = 'NF Season req.params.season'
	req.seasonid = season

	next()
}
router.use(getSeason)

router.get('/', (req, res) => res.redirect('./nf/1'))

router.use('/api',  require('./api'))
router.use('/leaderboards',  require('./leaderboards'))
router.use('/:mode/:season', getSeason, require('./nf'))
router.use((req, res) => res.status(404).render('404'))


module.exports = router
