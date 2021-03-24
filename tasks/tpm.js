process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;
require('dotenv').config({path:__dirname + '/../.env'})

const db = require('../lib/db')
const util = require('../lib/util')

tpm = (() => {})
tpm.call = async () => {

	const euids = {}

	for(var euid in euids) {
		let raw = await db.select("SELECT * FROM food ORDER BY random() LIMIT $1", [
			Math.floor(Math.random() * 5) + 1
		], 'all')

		// let foods = []
		// for (var key in raw)
		// 	foods.push({
		// 		'foodid': raw[key].id,
		// 		'unit': 0,
		// 		'value': Math.floor(Math.random() * 2) + 1
		// 	})

		//  await db.insertUpdate('userfood', {
		// 	userid: 38,
		// 	date: days[day],
		// 	food: JSON.stringify(foods),
		// }, ['userid', 'date'])

		console.log(days[day])
	}

	process.kill(process.pid)
}

tpm.call()
