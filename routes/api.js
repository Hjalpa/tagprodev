const express = require('express')
const router = express.Router()
const imp = require('../models/import')

router.get('/import/:euid', (req, res) => imp.game(req, res))

module.exports = router
