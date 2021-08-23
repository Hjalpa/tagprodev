const db = require ('../lib/db')
const express = require('express')
const router = express.Router()

router.get('/:player', (req, res) => require('../models/search').init(req, res))

module.exports = router
