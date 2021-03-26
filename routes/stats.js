const express = require('express')
const router = express.Router()

const stats = require('../models/stats')
router.get('/', (req, res) => stats.leaders(req, res))

const results = require('../models/stats-results')
router.get('/results', (req, res) => results.results(req, res))

module.exports = router
