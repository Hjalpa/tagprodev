process.env.NODE_TLS_REJECT_UNAUTHORIZED='0'

const fs = require('fs')
const express = require('express')
const cache = require('memory-cache')
const router = express.Router()
const db = require('../lib/db')
const exec = require('child_process').exec

// router.get('/.well-known/acme-challenge/yPUXgBo-hd41Eu67ZBCm_q-kSrs5Qs6mvuiTRlxwkVs', async (req, res) => res.send('yPUXgBo-hd41Eu67ZBCm_q-kSrs5Qs6mvuiTRlxwkVs.qHHteSBfKXYnAnQTAXoiP82unkcnaaMWYrV7cwF4zAk'))

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
router.get('/maps', cacheMiddleware(3600), (req, res) => require('../models/maps').init(req, res))
router.get('/log', (req, res) => require('../models/log').init(req, res))


router.use('/api',  require('./api'))
router.use('/stats',  require('./stats'))
router.use('/compare',  require('./compare'))
router.use((req, res) => res.status(404).render('404'))

module.exports = router
