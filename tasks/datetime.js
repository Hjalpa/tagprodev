process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;
require('dotenv').config({path:__dirname + '/../.env'})

const db = require('../lib/db')
const util = require('../lib/util')
const exec = require('child_process').exec

tpm = (() => {})
tpm.call = async () => {
	let games = await db.select('SELECT euid FROM game WHERE datetime IS NULL', [], 'all')
	for(let g of games) {
		await getDateTime(g.euid)
	}
}

async function getDateTime(euid) {
	exec(`php ../../tagpro-stats/index.php ${euid}`, async (error, raw) => {
		let data = JSON.parse(raw)

		try {
			await db.update('game', {
				euid: euid,
				datetime: data.game.datetime
			}, {
				euid: euid
			})

		}
		catch(error) {
			await db.insert('errorlog', {
				error: error,
				raw: data,
				euid: euid
			})

			console.log(error)
		} finally {
			console.log('finished ' + euid)
		}

	})
}


tpm.call()
