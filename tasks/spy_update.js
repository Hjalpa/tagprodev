require('dotenv').config({path:__dirname + '/../.env'})

const axios = require('axios')
const db = require('../lib/db')
const util = require('../lib/util')

init = (() => {})
init.call = async () => {
	let spies = await db.query("SELECT tpid, name FROM spy where name = 'anom' ORDER BY lastseendate DESC", 'all')
	for(let player in spies) {
		let p = spies[player]
		await axios.post(`http://localhost/api/spy/update`, {
			tpid: p.tpid
		})

		console.log(`spying on ${p.name}`)
	}
	process.kill(process.pid)
}

init.call()
