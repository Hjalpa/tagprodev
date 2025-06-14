require('dotenv').config({ path: __dirname + '/../.env' });

const db = require('../lib/db')
const util = require('../lib/util')

module.exports = async function () {
	const spies = await db.query("SELECT tpid, name FROM player WHERE tpid IS NOT NULL ORDER BY mmr DESC", 'all');

	for (const p of spies) {
		await fetch('https://tagpro.dev/api/spy_novice', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ tpid: p.tpid })
		});
		await new Promise(resolve => setTimeout(resolve, 2113))
		console.log(`spying on ${p.name}`)
	}
}
