const express = require('express')
const router = express.Router()

const wins = require('../models/stats-wins')
router.get('/wins', (req, res) => wins.init(req, res))

const mercies = require('../models/stats-mercies')
router.get('/mercies', (req, res) => mercies.init(req, res))

const general = require('../models/stats-general')
router.get('/general', (req, res) => general.init(req, res))

module.exports = router
