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

router.get('/', (req, res) => require('../models/player/dash').init(req, res))
router.get('/matches/:gamemode?', (req, res) => require('../models/player/matches').init(req, res))
router.get('/allies', (req, res) => require('../models/player/allies').init(req, res))
router.get('/opponents', (req, res) => require('../models/player/opponents').init(req, res))
router.get('/seasons', (req, res) => require('../models/player/seasons').init(req, res))
router.get('/maps.private', (req, res) => require('../models/player/maps').init(req, res))

module.exports = router
