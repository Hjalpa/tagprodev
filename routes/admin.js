const express = require('express')
const router = express.Router()

const overview = require('../models/admin/overview')
const games = require('../models/admin/games')
const seasons = require('../models/admin/seasons')
const players = require('../models/admin/players')
const maps = require('../models/admin/maps')
const teams = require('../models/admin/teams')

router.get('/', overview.list)

router.get('/games', games.list)
router.get('/games/:gameID', games.edit)

router.get('/seasons', seasons.list)
router.get(['/seasons/:seasonID', '/seasons/new'], seasons.edit)

router.get('/players', players.list)
router.post('/players', players.save)
router.delete('/players', players.delete)
router.get(['/players/:playerID', '/players/new'], players.edit)

router.get('/maps', maps.list)
router.get(['/maps/:mapID', '/maps/new'], maps.edit)

router.get('/teams', teams.list)
router.get(['/teams/:mapID', '/teams/new'], teams.edit)

module.exports = router
