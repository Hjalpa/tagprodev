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

router.get('/', (req, res) => require('../models/superleague/schedule').init(req, res))

router.get('/schedule/:id?', (req, res) => require('../models/superleague/schedule-playoffs').init(req, res))

router.get('/leaders/:id?', (req, res) => require('../models/superleague/leaders').init(req, res))

router.get('/records', (req, res) => require('../models/superleague/records').init(req, res))

router.get('/standings', (req, res) => require('../models/superleague/table').init(req, res))
router.get('/standings/playoffs', (req, res) => require('../models/superleague/playoffs').init(req, res))

router.get('/teams', cacheMiddleware(3600), (req, res) => require('../models/superleague/teams').init(req, res))

router.get('/stats/:id?', (req, res) => require('../models/superleague/stats').init(req, res))

router.get('/overview', (req, res) => require('../models/superleague/overview').init(req, res))

module.exports = router
