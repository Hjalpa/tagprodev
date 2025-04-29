const express = require('express')
const router = express.Router()

router.get('/seasons', (req, res) => require('../models/admin/seasons').init(req, res))
router.get('/players', (req, res) => require('../models/admin/players').init(req, res))
router.get('/leagues', (req, res) => require('../models/admin/leagues').init(req, res))

router.get('/users', (req, res) => require('../models/admin/users').init(req, res))
router.get('/logs', (req, res) => require('../models/admin/logs').init(req, res))

module.exports = router
