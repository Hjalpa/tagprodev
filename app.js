if(process.env.ENV != 'production')
	require('dotenv').config()

process.env['URL'] = (process.env.ENV === 'production' ? 'https://tagpro.dev' : 'http://localhost')

const fs = require('fs')
const compression = require('compression');
const bodyParser = require('body-parser')
const express = require('express')
const https = require('https')
const app = express()

const redis = require('redis')
const redisClient = redis.createClient({
    url: process.env.REDIS,
    retry_strategy: (options) => {
		if (options.error && options.error.code === 'ECONNREFUSED')
			return new Error('The server refused the connection')

		if (options.total_retry_time > 1000 * 60 * 60)
			return new Error('Retry time exhausted');

		if (options.attempt > 10)
			return undefined

		return Math.min(options.attempt * 100, 3000);
	},
})

redisClient.on('error', () => console.log('Redis error'))
redisClient.on('ready', () => console.log('Redis connected'))

redisClient.connect((err) => {
    if (err)
        console.log('Redis connection error:', err)
    else
        console.log('Redis connected')
})

app.use((req, res, next) => {
  req.redisClient = redisClient
  next()
})

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
