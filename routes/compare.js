const express = require('express')
const router = express.Router()
const compare = require('../models/compare')

router.get('/', (req, res) => compare.init(req, res))
router.post('/data', (req, res) => compare.data(req, res))

module.exports = router
