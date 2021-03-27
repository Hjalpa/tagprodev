const express = require('express')
const router = express.Router()

const wins = require('../models/stats-wins')
router.get('/wins', (req, res) => wins.init(req, res))

module.exports = router
