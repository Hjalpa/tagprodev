const express = require('express')
const router = express.Router()
const db = require('../lib/db')

let cacheMiddleware = e => {
	return async (req, res, next) => {
		const key =  '__express__' + req.originalUrl || req.url

		const cacheContent = await req.redisClient.get(key)

		if(cacheContent)
			return res.send(cacheContent)
		else {
			res.sendResponse = res.send
			res.send = async (body) => {
				await req.redisClient.set(key, body)
				res.sendResponse(body)
			}
			next()
		}
	}
}

router.get('/', cacheMiddleware(), async (req, res) => {
	let date = await db.select('SELECT date FROM seasonschedule WHERE seasonid = $1 AND gameid IS NOT NULL ORDER BY date ASC LIMIT 1', [req.seasonid], 'date')
	if(date)
		require('../models/season/overview').init(req, res)
	else
		require('../models/signup').init(req, res)
})

router.post('/signup', (req, res) => require('../models/signup').signup(req, res))
router.get('/draftpacket', (req, res) => require('../models/signup').draftpacket(req, res))

router.get('/matches/:id?', cacheMiddleware(), (req, res) => require('../models/season/matches').init(req, res))
router.get('/leaders/:id?', cacheMiddleware(), (req, res) => require('../models/season/leaders').init(req, res))
router.get('/records', cacheMiddleware(), (req, res) => require('../models/season/records').init(req, res))
router.get('/league', cacheMiddleware(), (req, res) => require('../models/season/league').init(req, res))
router.get('/playoffs', cacheMiddleware(), (req, res) => require('../models/season/playoffs').init(req, res))
router.get('/teams', cacheMiddleware(), (req, res) => require('../models/season/teams').init(req, res))
router.get('/stats/:id?', cacheMiddleware(), (req, res) => require('../models/season/stats').init(req, res))

module.exports = router
