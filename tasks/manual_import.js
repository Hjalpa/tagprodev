process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;
require('dotenv').config({path:__dirname + '/../.env'})

const axios = require('axios')
const db = require('../lib/db')
const util = require('../lib/util')

tpm = (() => {})
tpm.call = async () => {
	// await axios.post(`https://tagpro.dev/api/import`, {
	// 	euid: '2937493',
	// 	elo: 1976,
	// 	tpmid: 'ebb115f1-c5d3-47f8-a06f-2850ee86129b'
	// })
	let euid = process.argv[2]
	if(euid) {
		let gameExists = await db.select('SELECT id FROM game WHERE euid = $1', [euid], 'id')
		if(!gameExists) {
			await axios.post(`https://tagpro.dev/api/superleague/import`, {
				euid: euid,
				seasonid: 5 // adjust this for new seasons and create db entry within season table
			})
			console.log('added ' + euid)
		}
	}
	// await axios.get(`https://tagpro.dev`)
	process.kill(process.pid)
}

tpm.call()
