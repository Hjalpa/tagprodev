const db = require ('../../lib/db')
const util = require ('../../lib/util')

module.exports.init = async (req, res) => await init(req, res)
let init = async (req, res) => {
	try {
		let data = {
			title: 'League Table',
			nav: 'league-table',
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
				ORDER BY
				(count(*) filter (WHERE result_half_win = 1) / count(*)::DECIMAL) * 100 DESC
			) rank,

			player.name as player,
			count(*)as games,

			-- TO_CHAR( MIN(play_time) * interval '1 sec', 'MI:SS') as min_game_length,
			-- TO_CHAR( MAX(play_time) * interval '1 sec', 'MI:SS') as max_game_length,
			-- TO_CHAR((sum(play_time) / count(*)) * interval '1 sec', 'MI:SS') as average_game_length,
			count(*) filter (WHERE result_half_win = 1) as won,
			count(*) filter (WHERE result_half_lose = 1) as lost,

			ROUND(
				(
					count(*) filter (WHERE result_half_win = 1)
					/
					count(*)::DECIMAL
				) * 100
			, 2) || '%' as win_rate

		FROM playergame
		LEFT JOIN player ON player.id = playergame.playerid
		${f.where}
		GROUP BY player.name
		${f.having}
		ORDER BY win_rate DESC
	`
	return await db.select(sql, [], 'all')
}
