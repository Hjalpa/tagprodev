process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;
require('dotenv').config({path:__dirname + '/../.env'})

const axios = require('axios')
const db = require('../lib/db')
const util = require('../lib/util')

const fs = require('fs')


tpm = (() => {})
tpm.call = async () => {

		let raw = await fs.readFileSync('s1.txt', 'utf8')
		let data = raw.match(/[^,]+,[^,]+/g);
		for await (const x of data) {
			let tmp = x.split(',')
			let gameExists = await db.select('SELECT id FROM game WHERE euid = $1', [tmp[0]], 'id')
			if(!gameExists) {
				await axios.post(`https://tagpro.dev/api/import`, {
					euid: tmp[0],
					elo: tmp[1],
					tpmid: '659c9115-d01f-4313-9544-7f68719c8360'
				})
				console.log('added ' + tmp[0])
			}
		}
	process.kill(process.pid)
}

tpm.call()
