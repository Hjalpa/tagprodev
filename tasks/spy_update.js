process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0
process.removeAllListeners('warning')

require('dotenv').config({path:__dirname + '/../.env'})

const axios = require('axios')
const db = require('../lib/db')
const util = require('../lib/util')

init = (() => {})
init.call = async () => {
	let spies = await db.query("SELECT tpid, name FROM spy ORDER BY lastseendate DESC", 'all')
	for(let player in spies) {
		let p = spies[player]
		await axios.post(`https://tagpro.dev/api/spy/update`, {
			tpid: p.tpid
		})

		console.log(`spying on ${p.name}`)
	}
	process.kill(process.pid)
}

init.call()
