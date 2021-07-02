const express = require('express')
const router = express.Router()
const player = require('../models/player')

router.get('/:userId', (req, res) => player.init(req, res))

module.exports = router
