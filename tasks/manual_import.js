require('dotenv').config({path:__dirname + '/../.env'})

const axios = require('axios')
const db = require('../lib/db')
const util = require('../lib/util')

init = (() => {})
init.call = async () => {
	let seasonid = process.argv[2]
	let euid = process.argv[3]
	if(euid) {
		let gameExists = await db.select('SELECT id FROM game WHERE euid = $1', [euid], 'id')
		if(!gameExists) {
			await axios.post(`http://localhost/api/import`, {
				euid: euid,
				seasonid: seasonid
			})
			console.log('added ' + euid)
		}
	}
	process.kill(process.pid)
}

init.call()
