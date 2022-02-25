require('dotenv').config()
const fs = require('fs')
const compression = require('compression');
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const express = require('express')
const https = require('https')
const app = express()

const server = https.createServer({
 	key: fs.readFileSync('/etc/letsencrypt/live/tagpro.dev/privkey.pem'),
 	cert: fs.readFileSync('/etc/letsencrypt/live/tagpro.dev/cert.pem'),
 	ca: fs.readFileSync('/etc/letsencrypt/live/tagpro.dev/chain.pem')
}, app).listen(443)

// app.listen(80)

// const ipfilter = require('express-ipfilter').IpFilter
// const ips = ['::ffff:86.172.91.64']
// app.use(ipfilter(ips, { mode: 'allow' }))

app.set('views', __dirname + '/views')
app.set('view engine', 'pug')

app.use(compression())
app.use(cookieParser())

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(bodyParser.raw())

app.use(express.static(process.cwd() + '/public'))
app.use(require('./routes'))

console.log('Started https://tagpro.dev')
