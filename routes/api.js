const express = require('express')
const router = express.Router()
const routeCache = require('route-cache')

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
router.get('/pub/home', routeCache.cacheSeconds(60*30), (req, res) => require('../models/pub/home').init(req, res))
router.get('/pub/leaderboard', routeCache.cacheSeconds(60*30), (req, res) => require('../models/pub/leaderboard').init(req, res))
router.get('/pub/history/:timezone*', routeCache.cacheSeconds(60*30), (req, res) => require('../models/pub/history').init(req, res))
router.get('/pub/profile/:profileID/:timezone*', routeCache.cacheSeconds(60*30), (req, res) => require('../models/pub/profile').init(req, res))

router.get('/pub/openskill/:name', (req, res) => require('../models/pub/request').openskill(req, res))
router.get('/pub/home/:profileID', routeCache.cacheSeconds(60*30), (req, res) => require('../models/pub/home').playerRecentGames(req, res))

module.exports = router
