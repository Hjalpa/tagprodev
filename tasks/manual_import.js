process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;
require('dotenv').config({path:__dirname + '/../.env'})

const axios = require('axios')
const db = require('../lib/db')
const util = require('../lib/util')

init = (() => {})
init.call = async () => {
	let euid = process.argv[2]
	if(euid) {
		let gameExists = await db.select('SELECT id FROM game WHERE euid = $1', [euid], 'id')
		if(!gameExists) {
			await axios.post(`https://tagpro.dev/api/import`, {
				euid: euid,
				seasonid: 6 // adjust this for new seasons and create db entry within season table
			})
			console.log('added ' + euid)
		}
	}
	// await axios.get(`https://tagpro.dev`)
	process.kill(process.pid)
}

init.call()
