const express = require('express')
const router = express.Router()
const db = require('../lib/db')

router.get('/', (req, res) => require('../models/admin/seasons').init(req.res)
router.get('/teams', (req, res) => require('../models/admin/teams').init(req, res))
router.get('/players', (req, res) => require('../models/admin/players').init(req, res))
router.get('/matches', (req, res) => require('../models/admin/schedule').init(req, res))

module.exports = router
