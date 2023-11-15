require('dotenv').config({path:__dirname + '/../.env'})

const axios = require('axios')
const db = require('../lib/db')
const util = require('../lib/util')
const pub = require('../models/pub')

init = (() => {})
init.call = async () => {
	try {
		let url = 'https://tagpro.koalabeast.com/history/data?page=1&pageSize=50'
		let raw = await axios.get(url)

		raw.headers['content-type']
		const data = raw.data.games

		for await(let row of data) {
			let exists = await db.select('SELECT id FROM tp_game WHERE tpid = $1', [row.id], 'id')
			if(!exists) {
				await pub.game(row)
				console.log(`added tpid: ${row.id}`)
			}
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
