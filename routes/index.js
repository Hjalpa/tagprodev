const fs = require('fs')
const express = require('express')
const router = express.Router()
const db = require('../lib/db')
const exec = require('child_process').exec

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

const redis = require('redis')
const redisClient = redis.createClient({
    url: process.env.REDIS
})

let cacheMiddleware = e => {
	return async (req, res, next) => {
		const key =  '__express__' + req.originalUrl || req.url

		await redisClient.connect()
		const cacheContent = await redisClient.get(key)
		await redisClient.disconnect()

		if(cacheContent)
			return res.send(cacheContent)
		else {
			res.sendResponse = res.send
			res.send = async (body) => {
				await redisClient.connect()
				await redisClient.set(key, body)
				await redisClient.disconnect()
				res.sendResponse(body)
			}
			next()
		}
	}
}

router.get('/', (req, res) => require('../models/home').init(req, res))

router.use('/api',  require('./api'))

router.get('/spy', (req, res) => require('../models/spy').list(req, res))
router.get('/spy/generate', (req, res) => require('../models/spy').generate(req, res))

router.get('/player', cacheMiddleware(), (req, res) => require('../models/players').init(req, res))
router.use('/player/:player', getSeason, require('./player'))

router.get('/search', (req, res) => require('../models/search').init(req, res))

router.get('/rules', (req, res) => require('../models/markdown').init(req, res, 'rules'))
router.get('/faq', (req, res) => require('../models/markdown').init(req, res, 'faq'))

router.use('/:mode/:season', getSeason, require('./season'))

router.use((req, res) => res.status(404).render('404'))

module.exports = router
