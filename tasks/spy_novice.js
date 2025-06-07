require('dotenv').config({ path: __dirname + '/../.env' })

const db = require('../lib/db')
const util = require('../lib/util')

const init = (() => {})
init.call = async () => {
	const spies = await db.query("SELECT tpid, name FROM player WHERE tpid IS NOT NULL ORDER BY id DESC", 'all')

	for (const p of spies) {
		await fetch('http://localhost/api/spy_novice', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ tpid: p.tpid })
		})
		await new Promise(resolve => setTimeout(resolve, 2113))
		console.log(`spying on ${p.name}`)
	}

	process.kill(process.pid)
}

init.call()
