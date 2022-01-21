const fs = require('fs')
const express = require('express')
const cache = require('memory-cache')
const router = express.Router()
const db = require('../lib/db')
const exec = require('child_process').exec

// STOP APACHE IF THE PORT ERROR 80 exists AND RESTART AFTER CERT DONE
// router.get('/.well-known/acme-challenge/xEnQIF270N03wZzphl0IPqUkPkMaZOWxo_ZGlh0iipM', async (req, res) => res.send('xEnQIF270N03wZzphl0IPqUkPkMaZOWxo_ZGlh0iipM.hYRGI90GO3NsQmmnTO1Uwp7jwf_HnYCV7HPC3UrthtQ'))

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

router.get('/', (req, res) => res.redirect('./superleague'))

router.use('/api',  require('./api'))
router.use('/leaderboards',  require('./leaderboards'))
router.use('/superleague',  require('./superleague'))

// router.use('/search',  require('./search'))

router.use((req, res) => res.status(404).render('404'))

module.exports = router
