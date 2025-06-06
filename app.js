if(process.env.ENV != 'production')
	require('dotenv').config()

process.env['URL'] = (process.env.ENV === 'production' ? 'https://tagpro.dev' : 'http://localhost')

const fs = require('fs')
const compression = require('compression')
const bodyParser = require('body-parser')
const express = require('express')
const https = require('https')
const app = express()
const cors = require('cors')

// if(process.env.ENV === 'production') {
// 	const cron = require('node-cron')
// 	cron.schedule('*/15 * * * *', async () => {
// 		await fetch(`${process.env['URL']}/api/pub/import`, {
// 			method: 'POST',
// 			headers: {
// 				'Content-Type': 'application/json'
// 			},
// 			body: JSON.stringify({})
// 		})
// 	})
// }

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

console.log('TagPro.dev Started')
