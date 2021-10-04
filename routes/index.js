const fs = require('fs')
const express = require('express')
const cache = require('memory-cache')
const router = express.Router()
const db = require('../lib/db')
const exec = require('child_process').exec

// STOP APACHE IF THE PORT ERROR 80 exists AND RESTART AFTER CERT DONE
// router.get('/.well-known/acme-challenge/k22aKnwPMsi6msEAaTljSg-prgzHomgmdNbX-6K16j0', async (req, res) => res.send('k22aKnwPMsi6msEAaTljSg-prgzHomgmdNbX-6K16j0.qHHteSBfKXYnAnQTAXoiP82unkcnaaMWYrV7cwF4zAk'))

// https://scotch.io/tutorials/how-to-optimize-node-requests-with-simple-caching-strategies
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
				memCache.put(key,body,duration*1000)
				res.sendResponse(body)
			}
			next()
		}
	}
}

router.get('/', cacheMiddleware(3600), (req, res) => require('../models/leaderboards').init(req, res))
router.use('/records', require('./records'))
router.get('/rolling', cacheMiddleware(3600), (req, res) => require('../models/rolling').init(req, res))
router.use('/api',  require('./api'))
router.use('/stats',  require('./stats'))
router.use('/compare',  require('./compare'))
router.use('/player',  require('./player'))
router.use('/search',  require('./search'))
router.get('/maps', cacheMiddleware(3600), (req, res) => require('../models/maps').init(req, res))
router.get('/log', (req, res) => require('../models/log').init(req, res))
router.use((req, res) => res.status(404).render('404'))

module.exports = router
