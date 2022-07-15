process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0
process.removeAllListeners('warning')

require('dotenv').config({path:__dirname + '/../.env'})

const axios = require('axios')
const db = require('../lib/db')
const util = require('../lib/util')

init = (() => {})
init.call = async () => {
	let tpid = process.argv[2]
	if(tpid) {
		let spyExists = await db.select('SELECT id FROM spy WHERE tpid = $1', [tpid], 'id')
		if(!spyExists) {
			await axios.post(`https://tagpro.dev/api/spy`, {
				tpid: tpid
			})
			console.log('spying on ' + tpid)
		}
		else
			console.log('already spying on ' + tpid)
	}
	process.kill(process.pid)
}

init.call()
