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

router.get('/', (req, res) => require('../models/leaderboards').init(req, res))
router.get('/:id', (req, res) => require('../models/leaderboards').init(req, res))

module.exports = router
