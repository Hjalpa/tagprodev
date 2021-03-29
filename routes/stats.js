const express = require('express')
const router = express.Router()

router.get('/wins', (req, res) => require('../models/stats-wins').init(req, res))
router.get('/returns', (req, res) => require('../models/stats-returns').init(req, res))
router.get('/tags', (req, res) => require('../models/stats-tags').init(req, res))
router.get('/caps', (req, res) => require('../models/stats-caps').init(req, res))
router.get('/pups', (req, res) => require('../models/stats-pups').init(req, res))

module.exports = router
