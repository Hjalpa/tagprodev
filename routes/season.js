const express = require('express')
const router = express.Router()
const cache = require('memory-cache')
const db = require('../lib/db')

let memCache = new cache.Cache()
let cacheMiddleware = (duration) => {
	return (req, res, next) => {
		let key =  '__express__' + req.originalUrl || req.url
		let cacheContent = memCache.get(key)
		if(cacheContent){
			res.send( cacheContent )
			return
		}else{
			res.sendResponse = res.send
			res.send = (body) => {
				memCache.put(key,body,(duration*1000) * 24)
				res.sendResponse(body)
			}
			next()
		}
	}
}

router.get('/', async (req, res) => {
	let date = await db.select('SELECT date FROM seasonschedule WHERE seasonid = $1 AND gameid IS NOT NULL ORDER BY date ASC LIMIT 1', [req.seasonid], 'date')
	// if(date)
		require('../models/season/overview').init(req, res)
	// else
		// require('../models/signup').init(req, res)
})

router.post('/signup', (req, res) => require('../models/signup').signup(req, res))
router.get('/draftpacket', (req, res) => require('../models/signup').draftpacket(req, res))

router.get('/matches/:id?', cacheMiddleware(3600), (req, res) => require('../models/season/matches').init(req, res))
router.get('/leaders/:id?', cacheMiddleware(3600), (req, res) => require('../models/season/leaders').init(req, res))
router.get('/records', cacheMiddleware(3600), (req, res) => require('../models/season/records').init(req, res))
router.get('/league', cacheMiddleware(3600), (req, res) => require('../models/season/league').init(req, res))
router.get('/playoffs', (req, res) => require('../models/season/playoffs').init(req, res))
router.get('/teams', cacheMiddleware(3600), (req, res) => require('../models/season/teams').init(req, res))
router.get('/stats/:id?', cacheMiddleware(3600), (req, res) => require('../models/season/stats').init(req, res))

module.exports = router
