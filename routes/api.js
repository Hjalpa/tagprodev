const express = require('express')
const router = express.Router()
const cache = require('memory-cache')

let memCache = new cache.Cache()
let cacheMiddleware = duration => {
	return (req, res, next) => {
		let key =  '__express__' + req.originalUrl || req.url
		let cacheContent = memCache.get(key)
		if(cacheContent){
			res.send(cacheContent)
			return
		}else{
			res.sendResponse = res.send
			res.send = body => {
				memCache.put(key,body,(duration*1000) * 24)
				res.sendResponse(body)
			}
			next()
		}
	}
}

const imp = require('../models/import')
router.post('/import', (req, res) => imp.game(req, res))

// used for raw stats
const raw = require('../models/_raw')
router.get('/raw', (req, res) => raw.game(req, res))

// spies
const spy = require('../models/spy')
router.post('/spy', (req, res) => spy.player(req, res))
router.post('/spy/update', (req, res) => spy.update(req, res))

// pub data
router.post('/pub/import', (req, res) => require('../models/pub/import').import(req, res))
router.get('/pub/leaderboard', cacheMiddleware(400), (req, res) => require('../models/pub/leaderboard').init(req, res))
router.get('/pub/profile/:profileID', (req, res) => require('../models/pub/profile').init(req, res))

module.exports = router
