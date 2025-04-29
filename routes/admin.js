const express = require('express')
const router = express.Router()

router.get('/seasons', (req, res) => require('../models/admin/seasons').init(req, res))

module.exports = router
