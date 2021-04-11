const express = require('express')
const router = express.Router()
const records = require('../models/records')

router.get('/', (req, res) => records.init(req, res))

module.exports = router
