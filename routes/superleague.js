const express = require('express')
const router = express.Router()
const cache = require('memory-cache')

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

router.get('/', cacheMiddleware(3600), (req, res) => require('../models/superleague/schedule').init(req, res))

router.get('/leaders', (req, res) => require('../models/superleague/leaders').init(req, res))
router.get('/leaders/:id', (req, res) => require('../models/superleague/leaders').init(req, res))

router.get('/records', (req, res) => require('../models/superleague/records').init(req, res))

router.get('/table', (req, res) => require('../models/superleague/table').init(req, res))
router.get('/teams', cacheMiddleware(3600), (req, res) => require('../models/superleague/teams').init(req, res))
router.get('/stats', (req, res) => require('../models/superleague/stats').init(req, res))

module.exports = router
