const express = require('express')
const router = express.Router()

const overview = require('../models/admin/overview')
const games = require('../models/admin/games')
const seasons = require('../models/admin/seasons')
const players = require('../models/admin/players')
const maps = require('../models/admin/maps')

router.get('/', (req, res) => overview.list(req, res))

router.get('/games', (req, res) => games.list(req, res))
router.get('/games/:gameID', (req, res) => games.edit(req, res))

router.get('/seasons', (req, res) => seasons.list(req, res))
router.get('/seasons/:seasonID', (req, res) => seasons.edit(req, res))

router.get('/players', (req, res) => players.list(req, res))
router.get('/players/:playerID', (req, res) => players.edit(req, res))

router.get('/maps', (req, res) => maps.list(req, res))
router.get('/maps/:mapID', (req, res) => maps.edit(req, res))

module.exports = router
