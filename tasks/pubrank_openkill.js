require('dotenv').config({path:__dirname + '/../.env'})
const openskill = require ('../lib/openskill')
const db = require('../lib/db')

init = (() => {})
init.call = async () => {
	try {
		 let games = await db.select('SELECT * FROM tp_game WHERE id >= 0 ORDER BY id ASC', [], 'all')
		 for(let g of games) {
		 	console.log(`${g.id}`)
		 	await openskill.rank(g.id)
		 }
	}

	catch(e) {
		console.log(e)
	}

	finally {
		process.kill(process.pid)
	}
}

init.call()
