const db = require ('../lib/db')
const util = require ('../lib/util')

module.exports.init = async (req, res) => await init(req, res)
let init = async (req, res) => {
	let data = {
		title: 'Hold',
		tab: 'player stats',
		results: await getData(req.query)
	}
	res.render('stats', data);
}

async function getData(filters) {
	let f = util.getFilters(filters)
	let sql = `
		SELECT
			RANK() OVER (
				ORDER BY sum(hold) / (sum(play_time) / 60) DESC
			) rank,

			player.name as player,
			TO_CHAR( sum(hold) * interval '1 sec', 'mi:ss') as hold,
			TO_CHAR( (sum(hold) / (count(*))) * interval '1 sec', 'mi:ss') as per_game,
			TO_CHAR( (sum(hold) / (sum(play_time) / 60)) * interval '1 sec', 'mi:ss') as per_min

		FROM playergame
		LEFT JOIN player ON player.id = playergame.playerid
		${f.where}
		GROUP BY player.name
		${f.having}
		ORDER BY per_min DESC
		LIMIT 100
	`
	return await db.select(sql, [], 'all')
}
