const exec = require('child_process').exec
const db = require ('../lib/db')
const util = require ('../lib/util')

module.exports.init = async (req, res) => await init(req, res)
let init = async (req, res) => {

	let data = {
		title: 'Last Updates',
		tab: false,

		games: await log(),
	}

	res.render('log', data);
}

async function log() {
	let raw = await db.select(`
		SELECT
			euid,
			TO_CHAR(date, 'MON-DD-YYYY') as date,
			ROUND(elo)::integer as elo,
			TO_CHAR(duration * interval '1 sec', 'MI:SS') as duration,
			season.name as season
		FROM game
		LEFT JOIN season ON season.id = game.seasonid
		ORDER BY euid DESC
		LIMIT 100
	`, [], 'all')

	return raw
}
