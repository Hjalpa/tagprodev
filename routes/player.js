const express = require('express')
const router = express.Router()

router.get('/:userId/allies', (req, res) => require('../models/players/allies').init(req, res))
router.get('/:userId/opponents', (req, res) => require('../models/players/opponents').init(req, res))

module.exports = router
