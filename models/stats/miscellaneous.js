const db = require ('../../lib/db')
const util = require ('../../lib/util')

module.exports.init = async (req, res) => await init(req, res)
let init = async (req, res) => {
	try {
		let data = {
			title: 'Miscellaneous',
			nav: 'miscellaneous',
			maps: await req.maps,
			results: await getData(req.query)
		}
		res.render('stats', data);
	} catch(e) {
		res.status(400).json({error: e})
	}
}

async function getData(filters) {
	let f = util.getFilters(filters)
	let sql = `
		SELECT
			RANK() OVER (
				ORDER BY avg(elo) DESC
			) rank,
			player.name as player,

			TO_CHAR(avg(play_time) * interval '1 sec', 'MI:SS') as avg_game_length,
			ROUND(avg(elo)::NUMERIC, 2) as avg_game_elo

		FROM playergame
		LEFT JOIN player ON player.id = playergame.playerid
		LEFT JOIN game ON game.id = playergame.gameid
		LEFT JOIN map ON map.id = game.mapid
		${f.where}
		GROUP BY player.name
		${f.having}
		ORDER BY avg_game_elo DESC
	`
	return await db.select(sql, [], 'all')
}
