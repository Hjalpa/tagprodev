const express = require('express')
const router = express.Router()

const stats = require('../models/stats')
router.get('/', (req, res) => stats.leaders(req, res))


module.exports = router
