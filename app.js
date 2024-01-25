if(process.env.ENV != 'production')
	require('dotenv').config()

process.env['URL'] = (process.env.ENV === 'production' ? 'https://tagpro.dev' : 'http://localhost')

const fs = require('fs')
const compression = require('compression');
const bodyParser = require('body-parser')
const express = require('express')
const https = require('https')
const app = express()
const cors = require('cors');
const cron = require('node-cron')

if(process.env.ENV === 'production') {
	console.log('starting cron')
	cron.schedule('*/20 * * * *', () => {
		console.log('running import script from cron...')
		require('../models/pub/import').import()
	})
}

app.use(cors())

app.listen(80)

app.set('views', __dirname + '/views')
app.set('view engine', 'pug')

app.use(compression())

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(bodyParser.raw())

app.use(express.static(process.cwd() + '/public'))
app.use(require('./routes'))

console.log('App Started')
