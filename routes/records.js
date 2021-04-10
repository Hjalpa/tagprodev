const express = require('express')
const router = express.Router()
const records = require('../models/records')

router.get('/', (req, res) => records.init(req, res))
router.get('/v2', (req, res) => records.initv2(req, res))

module.exports = router
