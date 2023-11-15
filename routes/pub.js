const express = require('express')
const router = express.Router()

router.get('/', (req, res) => require('../models/pub/json').init(req, res))

module.exports = router
