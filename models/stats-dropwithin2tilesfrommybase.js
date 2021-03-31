const db = require ('../lib/db')
const util = require ('../lib/util')

module.exports.init = async (req, res) => await init(req, res)
let init = async (req, res) => {
	let data = {
		title: 'Drop Within 2 Tiles From My Base',
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
				ORDER BY
					TO_CHAR(
						(sum(play_time) / sum(drop_within_2_tiles_from_my_base)) * interval '1 sec'
					, 'MI:SS') ASC
			) rank,

			player.name as player,

			count(*) as games,
			SUM(drop_within_2_tiles_from_my_base) as drops,
			round( (sum(drop_within_2_tiles_from_my_base)::FLOAT / count(*))::numeric , 2) as per_game,
			TO_CHAR(
				(sum(play_time) / sum(drop_within_2_tiles_from_my_base)) * interval '1 sec'
			, 'HH24:MI:SS') as every

		FROM playergame
		LEFT JOIN player ON player.id = playergame.playerid
		${f.where}
		GROUP BY player.name
		${f.having}
		ORDER BY every ASC
		LIMIT 100
	`
	return await db.select(sql, [], 'all')
}
