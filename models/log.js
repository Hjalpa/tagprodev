const db = require ('../lib/db')
const util = require ('../lib/util')

module.exports.init = async (req, res) => await init(req, res)
let init = async (req, res) => {

	let data = {
		title: 'Last Updates',
		tab: false,

		games: await getData(),
	}

	res.render('log', data);
}

async function getData() {
	let raw = await db.select(`
		SELECT
			euid,
			TO_CHAR(date, 'DD Month YYYY') as date,
			season.name as season,
			ROUND(elo)::integer as elo,
			TO_CHAR(duration * interval '1 sec', 'MI:SS') as duration,
			redcaps as red,
			bluecaps as blue,
			winner
		FROM game
		LEFT JOIN season ON season.id = game.seasonid
		ORDER BY euid DESC
		LIMIT 100
	`, [], 'all')

	return raw
}
